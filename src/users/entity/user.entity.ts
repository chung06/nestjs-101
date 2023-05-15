import { BeforeInsert, BeforeUpdate, Column, Entity, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CustomBaseEntity } from 'src/common/entity/base.entity';

/**
 * User Entity
 */
@Entity({
  name: 'users',
})
export class UserEntity extends CustomBaseEntity {
  @Index({
    unique: true,
  })
  @Column()
  username: string;

  @Index({
    unique: true,
  })
  @Column()
  email: string;

  @Index({
    unique: true,
  })
  @Column({
    nullable: true,
  })
  phone: string;

  @Column()
  password: string;

  @Index()
  @Column()
  name: string;

  @Column()
  salt: string;

  @BeforeInsert()
  setUsername() {
    this.username = this.email;
  }

  @BeforeInsert()
  async hashPasswordBeforeInsert() {
    if (this.password) {
      await this.hashPassword();
    }
  }

  @BeforeUpdate()
  async hashPasswordBeforeUpdate() {
    if (this.password) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  async hashPassword() {
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
