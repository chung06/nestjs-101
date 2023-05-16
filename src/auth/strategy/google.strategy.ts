import { Strategy } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private userService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GG_CLIENT_ID'),
      clientSecret: configService.get<string>('GG_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GG_CALLBACK_URL'),
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/user.phonenumbers.read',
      ],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    console.log(profile);
    const { email, email_verified, name } = profile._json;
    if (!email && !email_verified) {
      return null;
    }

    const user = await this.userService.findOneBy({ username: email });
    if (user) {
      return user;
    } else {
      const password = this.userService.generateRandomPassword();
      const newUser = await this.userService.create({
        email: email,
        name: name,
        password: password,
      });
      return newUser;
    }
  }
}
