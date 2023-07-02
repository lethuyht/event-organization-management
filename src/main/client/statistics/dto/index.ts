import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class StatisticsDto {
  @Field()
  month: number;

  @Field({ nullable: true, defaultValue: new Date().getUTCFullYear() })
  @IsOptional()
  year: number;
}
