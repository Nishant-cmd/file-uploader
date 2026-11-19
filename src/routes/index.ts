import { Router } from 'express';
import { getValidFolderShare } from '../db/queries';
import { prisma } from '../lib/prisma';
import { createStorageSignedUrl } from '../lib/supabaseStorage';

const index = Router();

index.get('/', (req, res) => {
  res.render('index');
});

index.get('/share/:shareId', async (req, res, next) => {
  try {
    const share = await getValidFolderShare(req.params.shareId);
    if (!share) return res.status(404).render('share-not-found');
    const folders = await prisma.folder.findMany({ where: { ownerId: share.ownerId }, orderBy: { name: 'asc' } });
    const files = await prisma.file.findMany({ where: { ownerId: share.ownerId }, orderBy: { name: 'asc' } });
    const descendants = new Set<number>([share.folderId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const folder of folders) {
        if (folder.parentId !== null && descendants.has(folder.parentId) && !descendants.has(folder.id)) {
          descendants.add(folder.id);
          changed = true;
        }
      }
    }
    const visibleFolders = folders.filter((folder) => descendants.has(folder.id));
    const visibleFiles = files.filter((file) => file.folderId !== null && descendants.has(file.folderId));
    const getDepth = (folderId: number) => {
      let depth = 0;
      let folder = visibleFolders.find((item) => item.id === folderId);
      while (folder?.parentId !== null && folder?.parentId !== undefined && depth < 50) {
        depth++;
        folder = visibleFolders.find((item) => item.id === folder!.parentId);
      }
      return depth;
    };
    res.render('share', {
      root: share.folder,
      folders: visibleFolders.filter((folder) => folder.id !== share.folderId).map((folder) => ({ ...folder, depth: getDepth(folder.id) })),
      files: visibleFiles.map((file) => ({ ...file, depth: getDepth(file.folderId!) })),
      expiresAt: share.expiresAt,
      shareId: share.id,
    });
  } catch (err) { next(err); }
});

index.get('/share/:shareId/file/:fileId', async (req, res, next) => {
  try {
    const share = await getValidFolderShare(req.params.shareId);
    const fileId = Number(req.params.fileId);
    if (!share || !Number.isInteger(fileId)) return res.status(404).render('share-not-found');
    const file = await prisma.file.findFirst({ where: { id: fileId, ownerId: share.ownerId } });
    if (!file?.folderId || !file.storageKey) return res.status(404).render('share-not-found');
    let folderId: number | null = file.folderId;
    let included = false;
    for (let depth = 0; depth < 50 && folderId !== null; depth++) {
      if (folderId === share.folderId) { included = true; break; }
      const parentFolder: { parentId: number | null } | null = await prisma.folder.findUnique({
        where: { id: folderId }, select: { parentId: true },
      });
      folderId = parentFolder?.parentId ?? null;
    }
    if (!included) return res.status(404).render('share-not-found');
    const expiresIn = Math.max(1, Math.floor((share.expiresAt.getTime() - Date.now()) / 1000));
    res.redirect(await createStorageSignedUrl(file.storageKey, expiresIn, file.name));
  } catch (err) { next(err); }
});

export default index;
