import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class InterceptMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const url = req.url;
    const method = req.method;
    const datetime = Date;

    console.log('OI SOU O MIDDLEWARE');
    console.log(
      `horário da requisição: ${datetime.now()} verbo: ${method}, caminho: ${url}`,
    );
    next();
  }
}
