import { User } from '../../generated/prisma/client';
import { prisma } from '../lib/prisma';

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

export { createUser, getUser, getUserById };
