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
import * as dotenv from 'dotenv'
import { execSync } from 'node:child_process';
import { CreateUserDTO } from '../src/users/dto/create-user-dto.js';

dotenv.config( { path: '.env.test' } )

describe('User e2e', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService

  beforeAll(() => {
    execSync('npx prisma migrate deploy')
  })

  beforeEach(async () => {
    execSync('cross-env DATABASE_URL=file:./dev-test.db npx prisma migrate deploy')
    const module: TestingModule = await Test.createTestingModule({
      imports: [
         TasksModule,
         UsersModule,
         ConfigModule.forRoot( { envFilePath: '.env.test' } ),
         AuthModule,
         ServeStaticModule.forRoot({
         rootPath: join(process.cwd(), 'imgs'),
         serveRoot: '/files',
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    prismaService = module.get<PrismaService>(PrismaService)

    app.useGlobalPipes( new ValidationPipe( { whitelist: true, forbidNonWhitelisted: true } ) )

    await app.init();
  });
  
  afterEach( async ()=>{
    await app.close()
  })

  afterAll(async () => {
    await prismaService.$disconnect()
  })

  describe('/users', () => {
    it('POST - create user.', async () => {
      const user: CreateUserDTO = {
        name: 'teste',
        email: 'teste@gmail.com',
        password: 'senhaultraforte'
      }

      const res = await request(app.getHttpServer())
      .post('/users')
      .send(user)
      .expect(201)

      console.log(res.text)

    },10000)
  })
});
