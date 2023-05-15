import { IsString, IsPhoneNumber, IsOptional } from 'class-validator';

/**
 * register user data transform object
 */
export class UpdateUserDto {
  @IsOptional()
  @IsPhoneNumber()
  phone: string;

  @IsOptional()
  @IsString()
  name: string;
}
