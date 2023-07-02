import { Field, ObjectType, Scalar } from '@nestjs/graphql';
import dayjs, { Dayjs } from 'dayjs';
import { GraphQLScalarType } from 'graphql';

const formatDateScalar = new GraphQLScalarType({
  name: 'DateScalar',
  description: 'Custom output date',
  serialize(value) {
    if (value instanceof Date) {
      return dayjs(value).format('DD/MM/YYYY');
    }
    throw Error('GraphQL Date Scalar serializer expected a `Date` object');
  },
});

@ObjectType()
export class Revenue {
  @Field(() => Number, { defaultValue: 0 })
  service: number;

  @Field(() => Number, { defaultValue: 0 })
  event: number;
}

@ObjectType()
export class DetailsStatistic {
  @Field(() => formatDateScalar)
  date: Date;

  @Field(() => Number, { defaultValue: 0 })
  eventNumber: number;

  @Field(() => Number, { defaultValue: 0 })
  serviceNumber: number;
}

@ObjectType()
export class StatisticsOfMonth {
  @Field(() => Revenue)
  revenue: Revenue;

  @Field(() => [DetailsStatistic], { nullable: true })
  details: DetailsStatistic[];
}

export interface StatisticResult {
  revenue: {
    event: number;
    service: number;
  };
  details?: [{ date: Date; serviceNumber: number; eventNumber: number }] | null;
}
