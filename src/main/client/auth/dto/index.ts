import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';

@InputType()
export class SignUpDto {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  lastName: string;

  @Field()
  firstName: string;

  @Field()
  password: string;

  @Field()
  phoneNumber: string;
}

@InputType()
export class CodeVerifyDto {
  @Field()
  code: string;

  @Field()
  @IsEmail()
  email: string;
}

@InputType()
export class SignInDto {
  @Field()
  @IsEmail()
  @Transform((email) => email.toLowerCase())
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RefreshTokenDto {
  @Field()
  refreshToken: string;
}

@InputType()
export class SignOutDto extends RefreshTokenDto {}
