import {
  Body,
  Controller,
  Post,
  Req,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guard/jwt-refresh-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/register')
  async register(@Body() userRegisterDto: UserRegisterDto): Promise<any> {
    const user = await this.userService.findOne({
      username: userRegisterDto.email,
    });
    if (user) {
      throw new BadRequestException('username is already taken');
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Req() req) {
    return req.user;
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  refreshToken(@Req() req: Request) {
    const token = req.headers.authorization.split(' ')[1];
    return this.authService.createAccessTokenFromRefreshToken(token);
  }
}
