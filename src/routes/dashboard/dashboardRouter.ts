import { Router, Request, Response, NextFunction } from 'express';
import requireAuth from '../../middlewares/requireAuth';
import { logout } from '../../controllers/authController';
import uploadMiddleware from '../../middlewares/uploadMiddleware';
import {
  getRootFolders, getFolderContents, getFolderById, createFolder, createSubFolder,
  createFile, renameFolder, deleteFolder, getOwnedFile, listRootFiles, createFolderShare,
} from '../../db/queries';
import { createStorageSignedUrl, deleteStorageObjects, uploadToSupabase } from '../../lib/supabaseStorage';
import { prisma } from '../../lib/prisma';

const dashboardRouter = Router();

dashboardRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.render('dashboard_view/dashboard', {
      folders: await getRootFolders(req.user!.id), files: await listRootFiles(req.user!.id),
    });
  } catch (err) { next(err); }
});

dashboardRouter.get('/folder/:folderId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderId = Number(req.params.folderId);
    if (!Number.isInteger(folderId) || folderId < 1) return res.status(400).send('Invalid folder id');
    const contents = await getFolderContents(folderId, req.user!.id);
    if (!contents) return res.status(404).send('Folder not found');
    const breadcrumbs: { id: number; name: string }[] = [];
    let parentId = contents.parentId;
    for (let depth = 0; parentId !== null && depth < 50; depth++) {
      const parent = await getFolderById(parentId, req.user!.id);
      if (!parent) break;
      breadcrumbs.unshift({ id: parent.id, name: parent.name });
      parentId = parent.parentId;
    }
    res.render('dashboard_view/folder', { currentFolder: contents, folders: contents.children, files: contents.files, breadcrumbs });
  } catch (err) { next(err); }
});

dashboardRouter.post('/create-folder', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const name = String(req.body.folderName || '').trim();
    if (!name || name.length > 100) return res.status(400).send('Folder name must be between 1 and 100 characters');
    const rawParentId = req.body.parentFolderId;
    const parentId = rawParentId ? Number(rawParentId) : null;
    if (rawParentId && (!Number.isInteger(parentId) || parentId! < 1)) return res.status(400).send('Invalid parent folder');
    if (parentId !== null) {
      await createSubFolder(name, parentId, req.user!.id);
      return res.redirect(`/dashboard/folder/${parentId}`);
    }
    await createFolder(name, req.user!.id);
    return res.redirect('/dashboard');
  } catch (err) { next(err); }
});

dashboardRouter.post('/folder/:folderId/rename', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderId = Number(req.params.folderId);
    const name = String(req.body.folderName || '').trim();
    if (!Number.isInteger(folderId) || !name || name.length > 100) return res.status(400).send('Invalid folder name');
    const folder = await renameFolder(folderId, req.user!.id, name);
    if (!folder) return res.status(404).send('Folder not found');
    res.redirect(`/dashboard/folder/${folder.id}`);
  } catch (err) { next(err); }
});

dashboardRouter.post('/folder/:folderId/delete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderId = Number(req.params.folderId);
    if (!Number.isInteger(folderId)) return res.status(400).send('Invalid folder id');
    const folder = await getFolderById(folderId, req.user!.id);
    if (!folder) return res.status(404).send('Folder not found');
    const allFolders = await prisma.folder.findMany({ where: { ownerId: req.user!.id }, select: { id: true, parentId: true } });
    const descendantIds = new Set([folderId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const candidate of allFolders) {
        if (candidate.parentId !== null && descendantIds.has(candidate.parentId) && !descendantIds.has(candidate.id)) {
          descendantIds.add(candidate.id);
          changed = true;
        }
      }
    }
    const containedFiles = await prisma.file.findMany({
      where: { ownerId: req.user!.id, folderId: { in: [...descendantIds] } },
      select: { storageKey: true },
    });
    await deleteStorageObjects(containedFiles.flatMap((file) => file.storageKey ? [file.storageKey] : []));
    await deleteFolder(folderId, req.user!.id);
    res.redirect(folder.parentId ? `/dashboard/folder/${folder.parentId}` : '/dashboard');
  } catch (err) { next(err); }
});

dashboardRouter.post('/folder/:folderId/share', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const folderId = Number(req.params.folderId);
    const days = Number(req.body.days);
    if (!Number.isInteger(folderId) || ![1, 10, 30].includes(days)) return res.status(400).send('Choose a valid share duration');
    if (!await getFolderById(folderId, req.user!.id)) return res.status(404).send('Folder not found');
    const share = await createFolderShare(folderId, req.user!.id, new Date(Date.now() + days * 86400000));
    res.render('dashboard_view/share-created', { shareUrl: `${req.protocol}://${req.get('host')}/share/${share.id}`, folderId });
  } catch (err) { next(err); }
});

dashboardRouter.post('/upload', requireAuth, uploadMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) return res.status(400).send('No file uploaded');
    const rawFolderId = req.body.folderId;
    const folderId = rawFolderId ? Number(rawFolderId) : null;
    if (folderId !== null && (!Number.isInteger(folderId) || !await getFolderById(folderId, req.user!.id))) {
      return res.status(404).send('Folder not found');
    }
    const stored = await uploadToSupabase(req.file, req.user!.id);
    await createFile(req.file.originalname, req.file.size, req.file.mimetype, stored.url, req.user!.id, folderId, stored.storageKey);
    res.redirect(folderId ? `/dashboard/folder/${folderId}` : '/dashboard');
  } catch (err) { next(err); }
});

dashboardRouter.get('/file/:fileId', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileId = Number(req.params.fileId);
    const file = Number.isInteger(fileId) ? await getOwnedFile(fileId, req.user!.id) : null;
    if (!file) return res.status(404).send('File not found');
    res.render('dashboard_view/file', { file });
  } catch (err) { next(err); }
});

dashboardRouter.get('/file/:fileId/download', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileId = Number(req.params.fileId);
    const file = Number.isInteger(fileId) ? await getOwnedFile(fileId, req.user!.id) : null;
    if (!file) return res.status(404).send('File not found');
    if (!file.storageKey) return res.status(404).send('File storage is unavailable');
    res.redirect(await createStorageSignedUrl(file.storageKey, 60, file.name));
  } catch (err) { next(err); }
});

dashboardRouter.post('/file/:fileId/delete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const fileId = Number(req.params.fileId);
    const file = Number.isInteger(fileId) ? await getOwnedFile(fileId, req.user!.id) : null;
    if (!file) return res.status(404).send('File not found');
    if (file.storageKey) await deleteStorageObjects([file.storageKey]);
    await prisma.file.delete({ where: { id: file.id } });
    res.redirect(file.folderId ? `/dashboard/folder/${file.folderId}` : '/dashboard');
  } catch (err) { next(err); }
});

dashboardRouter.get('/log-out', requireAuth, logout);
export default dashboardRouter;
