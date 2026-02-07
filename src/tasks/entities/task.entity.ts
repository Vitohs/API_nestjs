import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsBoolean,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class Task {
  public id!: number;

  @IsString({ message: 'precisa ser um texto.' })
  @MinLength(5, { message: 'no minimo, 5 caracteres.' })
  @IsNotEmpty()
  public readonly name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(255)
  public readonly description!: string;

  @IsBoolean()
  @IsOptional()
  public readonly isCompleted!: boolean;

  @IsNumber()
  @IsNotEmpty()
  public readonly userId!: number;

  @IsOptional()
  public readonly createdAt?: Date;
}
