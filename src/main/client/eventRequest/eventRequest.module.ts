import { Module } from '@nestjs/common';
import { EventRequestResolver } from './eventRequest.resolver';
import { EventRequestService } from './eventRequest.service';

@Module({
  providers: [EventRequestResolver, EventRequestService],
})
export class EventRequestModule {}
