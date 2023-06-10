import { Injectable } from '@nestjs/common';
import { AddItemToCartDto } from './dto';
import { ValidateCartItem } from './command/validateCartItem.command';
import { CartItem } from '@/db/entities/CartItem';
import { Cart } from '@/db/entities/Cart';
import { messageKey } from '@/i18n';

@Injectable()
export class CartService {
  async addItemToCart(input: AddItemToCartDto, userId: string) {
    const { serviceItemId, hireDate, amount, hireEndDate } = input;

    await ValidateCartItem.availableServiceItemValidate({
      serviceItemId,
      amount,
      startDate: hireDate,
      endDate: hireEndDate,
    });

    let cart = await Cart.findOne({ where: { userId } });

    if (!cart) {
      cart = await Cart.save(Cart.create({ userId }));
    }

    await CartItem.save(CartItem.create({ ...input, cartId: cart.id }));
    return { message: messageKey.BASE.SUCCESSFULLY, success: true };
  }
}
