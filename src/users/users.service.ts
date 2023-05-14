import { Injectable } from '@nestjs/common';

// This should be a real class/interface representing a user entity
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john@gmail.com',
      password: 'changeme',
      phone: '+8412345678',
      email: 'john@gmail.com',
    },
    {
      userId: 2,
      username: 'maria@gmail.com',
      password: 'guess',
      phone: '+8412345679',
      email: 'maria@gmail.com',
    },
  ];

  async findOne(input: {
    username?: string;
    phone?: string;
  }): Promise<User | undefined> {
    if (input.username && input.phone) {
      return this.users.find(
        (user) =>
          user.username === input.username && user.phone === input.phone,
      );
    }
    return this.users.find(
      (user) => user.username === input.username || user.phone === input.phone,
    );
  }
}
