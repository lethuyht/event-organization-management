import { Module } from '@nestjs/common';
import { ServiceResolver } from './service.resolver';
import { ServiceService } from './service.service';

@Module({
  providers: [ServiceResolver, ServiceService],
})
export class ServiceModule {}
