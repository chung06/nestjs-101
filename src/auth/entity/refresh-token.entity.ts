import { CustomBaseEntity } from 'src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'refresh_token',
})
export class RefreshTokenEntity extends CustomBaseEntity {
  @Column()
  userId: string;

  @Column({ default: false })
  isRevoked: boolean;
}
