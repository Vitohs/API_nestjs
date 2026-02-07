import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class User {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  public readonly name!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  public readonly password!: string;

  @IsEmail()
  @IsNotEmpty()
  @MinLength(6)
  public readonly email!: string;

  @IsOptional()
  public readonly createdAt?: Date;
}
