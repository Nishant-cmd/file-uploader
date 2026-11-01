import { prisma } from '../lib/prisma';

async function main(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      username: 'johnDoe',
      email: 'johDoe@example.com',
      password: 'johnDoe123',
    },
  });
  console.log('Created user:', user);

  const allUsers = await prisma.user.findMany({
    where: {
      email: 'johnDoe@example.com',
    },
  });
  console.log('All user:', allUsers);
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
