import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ContractService } from './contract.service';
import { IContract, IContracts } from './interface';
import { GraphQLResolveInfo } from 'graphql';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { Roles } from '@/decorators/roles.decorator';
import { Auth } from '@/decorators/auth.decorator';
import { ROLE } from '@/common/constant';
import { Context, GetContext } from '@/decorators/user.decorator';
import { ConfirmContractDeposit, RequestContractDto } from './dto';

@Auth(['Roles'])
@Resolver()
export class ContractResolver {
  constructor(private contractService: ContractService) {}

  @Query(() => IContract)
  getContract(@Args('id') id: string, @Info() info: GraphQLResolveInfo) {
    return this.contractService.getOne(id, info);
  }

  @Roles(ROLE.Admin)
  @Query(() => IContracts)
  getContracts(@Args('queryParams') query: QueryFilterDto) {
    return this.contractService.getContracts(query);
  }

  @Query(() => IContracts)
  getMyContracts(
    @Args('queryParams') query: QueryFilterDto,
    @GetContext() ctx: Context,
  ) {
    return this.contractService.getMyContracts(query, ctx.currentUser);
  }

  @Mutation(() => IContract)
  requestCreateContract(
    @Args('input') input: RequestContractDto,
    @GetContext() ctx: Context,
  ) {
    return this.contractService.requestCreateContract(input, ctx.currentUser);
  }

  @Mutation(() => IContract)
  confirmContractDeposit(
    @Args('input') input: ConfirmContractDeposit,
    @GetContext() ctx: Context,
  ) {
    return this.contractService.confirmContractDeposit(input, ctx.currentUser);
  }
}
