import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  HttpException,
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
import { GoogleAuthGuard } from './guard/google.guard';
import { LineAuthGuard } from './guard/line.guard';
import { UserExceptions } from 'src/contants';

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

  @UseGuards(JwtAuthGuard)
  @Put('/revoke/:id')
  revokeRefreshToken(@Req() req, @Param('id') id: string) {
    this.authService.revokeRefreshToken(id, req.user);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/login')
  googleLogin() {
    return {};
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  googleCallback(@Req() req) {
    const user = req.user;
    return this.authService.login(user);
  }

  @UseGuards(LineAuthGuard)
  @Get('/line/login')
  lineLogin() {
    return {};
  }

  @UseGuards(LineAuthGuard)
  @Get('/line/callback')
  async lineCallback(@Req() req) {
    const user: UserSerializer = req.user;
    const tokens = await this.authService.login(user);
    if (!user.email && !user.phone) {
      throw new HttpException(
        { code: UserExceptions.UpdateEmailException, tokens: tokens },
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.authService.login(user);
  }
}
