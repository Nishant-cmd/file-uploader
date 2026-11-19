import { User } from '../../generated/prisma/client';
import { prisma } from '../lib/prisma';

async function createFile(
  name: string,
  size: number,
  mimetype: string,
  url: string,
  ownerId: number,
  folderId?: number | null,
  storageKey?: string | null,
) {
  return await prisma.file.create({
    data: {
      name,
      size,
      mimetype,
      url,
      ownerId,
      folderId: folderId ?? null,
      storageKey: storageKey ?? null,
    },
  });
}

async function createUser(username: string, email: string, password: string): Promise<void> {
  await prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

async function getUser(username: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      username,
    },
  });
}

async function getUserById(userId: number): Promise<User | null> {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
}

async function createFolder(name: string, userId: number) {
  return await prisma.folder.create({
    data: {
      name,
      ownerId: userId,
    },
  });
}

async function createSubFolder(name: string, parentId: number, userId: number) {
  const parent = await prisma.folder.findFirst({
    where: {
      id: parentId,
      ownerId: userId,
    },
  });

  if (!parent) {
    throw new Error('Parent folder not found');
  }

  return await prisma.folder.create({
    data: {
      name,
      ownerId: userId,
      parentId,
    },
  });
}

async function getRootFolders(userId: number) {
  return await prisma.folder.findMany({
    where: {
      ownerId: userId,
      parentId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getAllFolders(userId: number) {
  return await prisma.folder.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

async function getFolderById(folderId: number, userId: number) {
  return await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });
}

async function getSubFolders(parentId: number, userId: number) {
  return await prisma.folder.findMany({
    where: {
      parentId,
      ownerId: userId,
    },
    orderBy: {
      name: 'asc',
    },
  });
}

async function getFolderContents(folderId: number, userId: number) {
  return await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
    include: {
      children: {
        where: {
          ownerId: userId,
        },
      },
      files: {
        where: {
          ownerId: userId,
        },
      },
    },
  });
}

async function renameFolder(folderId: number, userId: number, newName: string) {
  const result = await prisma.folder.updateMany({
    where: {
      id: folderId,
      ownerId: userId,
    },
    data: {
      name: newName,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return await prisma.folder.findFirst({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });
}

async function deleteFolder(folderId: number, userId: number) {
  const result = await prisma.folder.deleteMany({
    where: {
      id: folderId,
      ownerId: userId,
    },
  });

  return result.count > 0;
}

async function getOwnedFile(fileId: number, userId: number) {
  return prisma.file.findFirst({ where: { id: fileId, ownerId: userId } });
}

async function listRootFiles(userId: number) {
  return prisma.file.findMany({ where: { ownerId: userId, folderId: null }, orderBy: { createdAt: 'desc' } });
}

async function createFolderShare(folderId: number, ownerId: number, expiresAt: Date) {
  return prisma.folderShare.create({ data: { folderId, ownerId, expiresAt } });
}

async function getValidFolderShare(id: string) {
  return prisma.folderShare.findFirst({
    where: { id, expiresAt: { gt: new Date() } },
    include: { folder: { include: { children: true, files: true } } },
  });
}

export {
  createUser,
  getUser,
  getUserById,
  createFile,
  createFolder,
  createSubFolder,
  getRootFolders,
  getAllFolders,
  getFolderById,
  getSubFolders,
  getFolderContents,
  renameFolder,
  deleteFolder,
  getOwnedFile,
  listRootFiles,
  createFolderShare,
  getValidFolderShare,
};
