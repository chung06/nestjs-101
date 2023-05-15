import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('user')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateInfo(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    const success = await this.userService.update(req.user.id, updateUserDto);
    if (!success) {
      throw new HttpException('update fail', HttpStatus.BAD_REQUEST);
    }
    return { message: 'success' };
  }
}
