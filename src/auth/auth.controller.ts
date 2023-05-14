import {
  Body,
  Controller,
  Post,
  Request,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/user-register.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

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
  login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  profile(@Request() req) {
    return req.user;
  }
}
