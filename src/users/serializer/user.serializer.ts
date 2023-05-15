import { Expose } from 'class-transformer';

export class UserSerializer {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  phone: string;

  @Expose()
  name: string;
}
