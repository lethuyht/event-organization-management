import { Args, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ICart } from './interface';
import { Context, GetContext } from '@/decorators/user.decorator';
import { Auth } from '@/decorators/auth.decorator';
import { CartService } from './cart.service';
import { GetCartComment } from './command/getCartQuery.command';
import { GraphQLResolveInfo } from 'graphql';
import { Cart } from '@/db/entities/Cart';
import { AddItemToCartDto } from './dto';
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
    // const relations = info ? Cart.getRelations(info) : [];
    return this.cartService.getMyCart(currentUser.id, info);
  }

  @Mutation(() => ResponseMessageBase, { name: 'addItemToCart' })
  addItemToCart(
    @Args('input') input: AddItemToCartDto,
    @GetContext() ctx: Context,
  ) {
    return this.cartService.addItemToCart(input, ctx.currentUser.id);
  }

  @Mutation(() => ResponseMessageBase, { name: 'removeCartItem' })
  removeCartItem(@Args('cartItemId') id: string, @GetContext() ctx: Context) {
    return this.cartService.removeCartItem(id, ctx.currentUser);
  }
}
