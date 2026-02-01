import { Body, Controller, Post } from '@nestjs/common';
import { LoginDTO } from './dto/login-dto.js';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post()
  login(@Body() data: LoginDTO) {
    return this.authService.Login(data);
  }
}
