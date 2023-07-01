import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ServiceItemService } from './serviceItem.service';
import { ResponseMessageBase } from '@/base/interface';

@Resolver()
export class ServiceItemResolver {
  constructor(private serviceItemService: ServiceItemService) {}

  @Mutation(() => ResponseMessageBase, { name: 'deleteServiceItem' })
  deleteServiceItem(@Args('id') id: string) {
    return this.serviceItemService.deleteServiceItem(id);
  }
}
