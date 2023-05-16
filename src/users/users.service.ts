import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { UserSerializer } from './serializer/user.serializer';
import * as bcrypt from 'bcrypt';
import { plainToClass } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    createUserDto: DeepPartial<UserEntity>,
    returnEntity?: boolean,
  ): Promise<UserSerializer | UserEntity> {
    const user = await this.userRepository.findOne({
      where: [
        {
          username:
            createUserDto.username ??
            createUserDto.email ??
            createUserDto.phone,
        },
        { phone: createUserDto.phone },
      ],
    });
    if (user) {
      throw new BadRequestException('username or phone is already taken');
    }
    createUserDto.salt = await bcrypt.genSalt();
    const dbUser = this.userRepository.create(createUserDto);
    await dbUser.save();
    if (returnEntity) {
      return dbUser;
    }
    return plainToClass(UserSerializer, dbUser, {
      excludeExtraneousValues: true,
    });
  }

  async findOneBy(
    findOptions: DeepPartial<FindOptionsWhere<any>>,
    returnEntity?: boolean,
  ): Promise<UserSerializer | UserEntity | null> {
    const dbUser = await this.userRepository.findOneBy(findOptions);
    if (returnEntity) {
      return dbUser;
    }
    return plainToClass(UserSerializer, dbUser, {
      excludeExtraneousValues: true,
    });
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<UserSerializer | null> {
    const user = await this.userRepository.findOne({
      where: [
        {
          username: username,
        },
        {
          phone: username,
        },
      ],
    });
    if (user && (await user.validatePassword(password))) {
      return plainToClass(UserSerializer, user, {
        excludeExtraneousValues: true,
      });
    }
    return null;
  }

  async update(id: string, user: UpdateUserDto): Promise<boolean> {
    try {
      const result = await this.userRepository.update(id, user);
      if (result) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  generateRandomPassword(length?: number): string {
    if (!length) {
      length = 12;
    }
    const characters =
      '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async findOrCreate(
    createUserDto: DeepPartial<UserEntity>,
  ): Promise<UserSerializer> {
    const user = await this.userRepository.findOne({
      where: [
        {
          username:
            createUserDto.username ??
            createUserDto.email ??
            createUserDto.phone,
        },
        { phone: createUserDto.phone },
      ],
    });
    if (user) {
      return user;
    } else {
      if (!createUserDto.password) {
        const password = this.generateRandomPassword();
        createUserDto.password = password;
      }
      createUserDto.salt = await bcrypt.genSalt();
      const dbUser = this.userRepository.create(createUserDto);
      await dbUser.save();
      return plainToClass(UserSerializer, dbUser, {
        excludeExtraneousValues: true,
      });
    }
  }
}
