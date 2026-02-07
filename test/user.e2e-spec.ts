import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { TasksModule } from '../src/tasks/tasks.module.js';
import { UsersModule } from '../src/users/users.module.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../src/auth/auth.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'node:path';
import { PrismaService } from '../src/prisma/prisma.service.js';
import * as dotenv from 'dotenv';
import { execSync } from 'node:child_process';
import { CreateUserDTO } from '../src/users/dto/create-user-dto.js';
import { UpdateUserDTO } from '../src/users/dto/update-user-dto.js';
import { LoginDTO } from '../src/auth/dto/login-dto.js';

dotenv.config({ path: '.env.test' });

describe('User e2e', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeAll(() => {
    execSync('npx prisma migrate deploy');
  });

  beforeEach(async () => {
    execSync(
      'cross-env DATABASE_URL=file:./dev-test.db npx prisma migrate deploy',
    );
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TasksModule,
        UsersModule,
        ConfigModule.forRoot({ envFilePath: '.env.test' }),
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: join(process.cwd(), 'imgs'),
          serveRoot: '/files',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    prismaService = module.get<PrismaService>(PrismaService);

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    // await prismaService.user.deleteMany();
    await prismaService.$disconnect();
  });

  describe('/users', () => {
    // describe('/ POST create user.', () => {
    //   it('should create user succesfully', async () => {
    //     const user: CreateUserDTO = {
    //       name: 'teste',
    //       email: 'teste@gmail.com',
    //       password: 'senhaultraforte',
    //     };

    //     const res = await request(app.getHttpServer())
    //       .post('/users')
    //       .send(user)
    //       .expect(201);

    //     console.log(res.text);
    //   }, 10000);

    //   // it('should throw error in class-validator', async () => {
    //   //   const user: CreateUserDTO = {
    //   //     name: 'teste',
    //   //     email: 'email@gmail.com',
    //   //     password: '111',
    //   //   };

    //   //   const res = await request(app.getHttpServer())
    //   //     .post('/users')
    //   //     .send(user)
    //   //     .expect(400);

    //   //   console.log(res.body);
    //   // }, 10000);
    // });

    // describe('/ PATCH update user.', () => {
    //   it('should update user succesfully.', async () => {
    //     const user: CreateUserDTO = {
    //       name: 'victorrr',
    //       email: 'vv@gmail.com',
    //       password: 'vvsoltou',
    //     };

    //     const login: LoginDTO = {
    //       email: user.email,
    //       password: user.password,
    //     };

    //     const dataUpdate: UpdateUserDTO = {
    //       name: 'vitãoo?',
    //     };

    //     const create = await request(app.getHttpServer())
    //       .post('/users')
    //       .send(user)
    //       .expect(201);

    //     const auth = await request(app.getHttpServer())
    //       .post('/auth')
    //       .send(login)
    //       .expect(201);

    //     const update = await request(app.getHttpServer())
    //       .patch(`/users/${auth.body.data.id}`)
    //       .set('Authorization', `Bearer ${auth.body.token}`)
    //       .send(dataUpdate)
    //       .expect(200);

    //     console.log(update.body);
    //   }, 10000);
    // });

    // describe('/ DELETE "delete" user.', () => {
    //   it('should delete user seccesfully.', async () => {
    //     const user: CreateUserDTO = {
    //       name: 'vao me excluir',
    //       email: 'empty@gmail.com',
    //       password: 'manobrown',
    //     };
    //     const login: LoginDTO = {
    //       email: user.email,
    //       password: user.password,
    //     };
    //     const create = await request(app.getHttpServer())
    //       .post('/users')
    //       .send(user)
    //       .expect(201);

    //     const auth = await request(app.getHttpServer())
    //       .post('/auth')
    //       .send(login)
    //       .expect(201);

    //     const deleteRes = await request(app.getHttpServer())
    //       .delete(`/users/${auth.body.data.id}`)
    //       .set('Authorization', `Barer ${auth.body.token}`)
    //       .expect(200);

    //     console.log(deleteRes.body);
    //   }, 10000);
    // });
    
    describe('/ POST upload avatar.', () => {
      it('should upload avatar succesfully.', async () => {
        const user: CreateUserDTO = {
          name: 'tenho foto',
          email: 'sim@gmail.com',
          password: 'temumasenhaaqui'
        }
        const login: LoginDTO = {
          email: user.email,
          password: user.password
        }

        await request(app.getHttpServer())
        .post('/users')
        .send(user)
        .expect(201)

        const auth = await request(app.getHttpServer())
        .post('/auth')
        .send(login)
        .expect(201)

        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
          0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
          0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
          0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
          0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
          0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00,
          0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
          0x42, 0x60, 0x82
        ]);

        const uploadRes = await request(app.getHttpServer())
        .post('/users/upload')
        .set('Authorization', `Bearer ${auth.body.token}`)
        .attach('file', pngBuffer, 'victor.png')
        .expect(201)

        console.log(uploadRes.body)
        
      }, 10000);
    });
  });
});
