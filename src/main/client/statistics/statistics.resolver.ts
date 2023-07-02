import { Args, Query, Resolver } from '@nestjs/graphql';
import { StatisticsOfMonth } from './interface';
import { StatisticsDto } from './dto';
import { StatisticService } from './statistic.service';

@Resolver()
export class StatisticsResolver {
  constructor(private statisticService: StatisticService) {}

  @Query(() => StatisticsOfMonth)
  statisticOfMonth(@Args('input') input: StatisticsDto) {
    return this.statisticService.statisticOfMonth(input);
  }
}
