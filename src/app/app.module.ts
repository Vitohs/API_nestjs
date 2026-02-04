import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { UsersModule } from '../users/users.module.js';
import { InterceptMiddleware } from '../common/middlewares/interceptador.middleware.js';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module.js';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    TasksModule,
    UsersModule,
    ConfigModule.forRoot(),
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'imgs'),
      serveRoot: '/files',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(InterceptMiddleware).forRoutes({
      path: '/users/*path',
      method: RequestMethod.GET,
    });
  }
}
