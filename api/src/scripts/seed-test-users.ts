import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user-role.enum';
import { UserStatus } from '../users/user-status.enum';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const usersService = app.get(UsersService);
  const configService = app.get(ConfigService);

  const saltRounds = parseInt(
    configService.get<string>('BCRYPT_SALT_ROUNDS', '10'),
    10,
  );

  const seeds: Array<{
    email: string;
    password: string;
    role: UserRole;
    name: string;
  }> = [
    {
      email: 'admin@example.com',
      password: 'Admin1234!',
      role: UserRole.ADMIN,
      name: 'Admin User',
    },
    {
      email: 'customer@example.com',
      password: 'Customer1234!',
      role: UserRole.CUSTOMER,
      name: 'Demo Customer',
    },
  ];

  for (const seed of seeds) {
    const existing = await usersService.findByEmail(seed.email);
    if (existing) {
      console.log(`User ${seed.email} already exists, skipping.`);
      continue;
    }

    const passwordHash = await bcrypt.hash(seed.password, saltRounds);
    await usersService.create({
      email: seed.email,
      passwordHash,
      role: seed.role,
      name: seed.name,
      status: UserStatus.ACTIVE,
    });
    console.log(`Created ${seed.role} user: ${seed.email}`);
  }

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
