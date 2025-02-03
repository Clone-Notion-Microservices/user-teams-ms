import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.trim())
  public password: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'team_member'])
  public role?: string;

  @IsBoolean()
  @IsOptional()
  public available?: boolean;

  @IsArray()
  @IsOptional()
  public projects_permission?: [];

  @IsArray()
  @IsOptional()
  public tasks_permission?: [];
}
