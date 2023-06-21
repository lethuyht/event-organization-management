import { BadRequestException, Injectable } from '@nestjs/common';
import { AddItemToCartDto } from './dto';
import { ValidateCartItem } from './command/validateCartItem.command';
import { CartItem } from '@/db/entities/CartItem';
import { Cart } from '@/db/entities/Cart';
import { messageKey } from '@/i18n';
import { User } from '@/db/entities/User';

@Injectable()
export class CartService {
  async addItemToCart(input: AddItemToCartDto, userId: string) {
    const { serviceItemId, hireDate, amount, hireEndDate } = input;

    let cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await Cart.save(Cart.create({ userId }));
    }

    const existedCartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        serviceItemId: serviceItemId,
        hireDate,
        hireEndDate,
      },
    });

    const newAmount = (existedCartItem?.amount || 0) + amount;

    await ValidateCartItem.availableServiceItemValidate({
      serviceItemId,
      amount: newAmount,
      startDate: hireDate,
      endDate: hireEndDate,
    });

    const newCartItem = CartItem.merge(
      existedCartItem ?? CartItem.create({ ...input, cartId: cart.id }),
      { amount: newAmount },
    );

    await CartItem.save(newCartItem);
    return { message: messageKey.BASE.SUCCESSFULLY, success: true };
  }

  async removeCartItem(cartItemId: string, currentUser: User) {
    const cart = await Cart.findOne({
      where: { userId: currentUser.id },
      relations: ['cartItems'],
    });

    if (
      !cart ||
      (cart &&
        cart.cartItems.findIndex((cartItem) => cartItem.id === cartItemId) < 0)
    ) {
      throw new BadRequestException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    await CartItem.delete({ id: cartItemId });
    return { message: messageKey.BASE.SUCCESSFULLY, success: true };
  }
}
