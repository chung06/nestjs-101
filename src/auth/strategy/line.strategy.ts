import { Strategy } from 'passport-line-v2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class LineStrategy extends PassportStrategy(Strategy, 'line') {
  constructor(
    private userService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      channelID: configService.get<string>('LINE_CHANNEL_ID'),
      channelSecret: configService.get<string>('LINE_CHANNEL_SECRET'),
      callbackURL: configService.get<string>('LINE_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    console.log(profile);
    const findOrCreateUser = {
      username: profile.id,
      name: profile.displayName,
    };
    return this.userService.findOrCreate(findOrCreateUser);
  }
}
