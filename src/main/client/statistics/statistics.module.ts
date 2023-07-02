import { Module } from '@nestjs/common';
import { StatisticsResolver } from './statistics.resolver';
import { StatisticService } from './statistic.service';

@Module({
  providers: [StatisticsResolver, StatisticService],
})
export class StatisticsModule {}
