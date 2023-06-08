import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ICart } from './interface';
import { Context, GetContext } from '@/decorators/user.decorator';
import { Auth } from '@/decorators/auth.decorator';
import { CartService } from './cart.service';
import { GetCartComment } from './command/getCartQuery.command';
import { GraphQLResolveInfo } from 'graphql';
import { Cart } from '@/db/entities/Cart';
import { AddItemToCartDto } from './dto';
import { RefreshResponse } from '../auth/interface';
import { ResponseMessageBase } from '@/base/interface';

@Resolver()
@Auth(['Roles'])
export class CartResolver {
  constructor(private cartService: CartService) {}

  @Query(() => ICart, { name: 'getMyCart' })
  getMyCart(
    @GetContext() { currentUser }: Context,
    @Info() info: GraphQLResolveInfo,
  ) {
    const relations = info ? Cart.getRelations(info) : [];
    return GetCartComment.getCartByUserId(currentUser.id, true, relations);
  }

  @Mutation(() => ResponseMessageBase, { name: 'addItemToCart' })
  addItemToCart(
    @Args('input') input: AddItemToCartDto,
    @GetContext() ctx: Context,
  ) {
    return this.cartService.addItemToCart(input, ctx.currentUser.id);
  }
}