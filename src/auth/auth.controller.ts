import {
  Body,
  Controller,
  Post,
  Req,
  BadRequestException,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { Request } from 'express';
import { plainToClass } from 'class-transformer';
import { UserSerializer } from 'src/users/serializer/user.serializer';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.OK)
  async register(@Body() userRegisterDto: UserRegisterDto): Promise<any> {
    return await this.userService.create(userRegisterDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Req() req) {
    return plainToClass(UserSerializer, req.user, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  refreshToken(@Req() req: Request) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.createAccessTokenFromRefreshToken(token);
  }
}
