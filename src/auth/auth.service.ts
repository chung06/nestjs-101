import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenExceptions } from 'src/contants';
import { RefreshTokenInterface } from './interface/refresh-token.interface';
import { UserSerializer } from 'src/users/serializer/user.serializer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    return await this.usersService.validateUser(username, pass);
  }

  async login(user: UserSerializer) {
    return {
      access_token: this.createAccessToken(user),
      refresh_token: this.createRefreshToken(user),
    };
  }

  createAccessToken(payload: UserSerializer): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      { subject: payload.id },
    );
  }

  createRefreshToken(payload: UserSerializer): string {
    return this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '30d', subject: payload.id },
    );
  }

  public async createAccessTokenFromRefreshToken(
    refreshToken: string,
  ): Promise<{
    token: string;
  }> {
    const user = await this.decodeRefreshToken(refreshToken);
    const token = await this.createAccessToken(user);
    return {
      token,
    };
  }

  async decodeRefreshToken(token: string): Promise<UserSerializer> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return this.getUserFromRefreshTokenPayload(payload);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        TokenExceptions.InvalidRefreshTokon,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getUserFromRefreshTokenPayload(
    payload: RefreshTokenInterface,
  ): Promise<UserSerializer> {
    const id = payload.sub;

    if (!id) {
      throw new HttpException(
        TokenExceptions.InvalidRefreshTokon,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.findOneBy({ id });
  }
}
