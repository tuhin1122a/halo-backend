import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create/Update Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskpro.com' },
    update: {},
    create: {
      email: 'admin@taskpro.com',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  // Create/Update Regular User
  const user = await prisma.user.upsert({
    where: { email: 'user@taskpro.com' },
    update: {},
    create: {
      email: 'user@taskpro.com',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log('Users created:', { admin: admin.email, user: user.email });
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
