import { HttpException, HttpStatus, Injectable, Param } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { TokenExceptions } from 'src/contants';
import { RefreshTokenInterface } from './interface/refresh-token.interface';
import { UserSerializer } from 'src/users/serializer/user.serializer';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshTokenEntity } from './entity/refresh-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenReportsitory: Repository<RefreshTokenEntity>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    return await this.usersService.validateUser(username, pass);
  }

  async login(user: UserSerializer) {
    return {
      access_token: this.createAccessToken(user),
      refresh_token: await this.createRefreshToken(user),
    };
  }

  createAccessToken(payload: UserSerializer): string {
    return this.jwtService.sign(
      { ...payload, type: 'access' },
      { subject: payload.id },
    );
  }

  async createRefreshToken(payload: UserSerializer): Promise<string> {
    const refreshToken = this.refreshTokenReportsitory.create();
    refreshToken.userId = payload.id;
    const savedToken = await refreshToken.save();
    return this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '30d', subject: payload.id, jwtid: savedToken.id },
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
        TokenExceptions.InvalidRefreshToken,
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
        TokenExceptions.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.usersService.findOneBy({ id });
  }

  async revokeRefreshToken(id: string, user: UserSerializer) {
    const token = await this.refreshTokenReportsitory.findOne({
      where: [{ id: id, userId: user.id }],
    });
    if (!token) {
      throw new HttpException(
        TokenExceptions.TokenNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    token.isRevoked = true;
    await token.save();
  }

  async isRefreshTokenRevoked(id: string): Promise<boolean> {
    const token = await this.refreshTokenReportsitory.findOne({
      where: [{ id: id }],
    });
    if (!token) {
      throw new HttpException(
        TokenExceptions.TokenNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return token.isRevoked;
  }
}
