import { Cart } from '@/db/entities/Cart';
import { messageKey } from '@/i18n';
import { BadRequestException } from '@nestjs/common';
import { getManager } from 'typeorm';

export class GetCartComment {
  static async getCartByUserId(
    userId: string,
    throwErrorIfNotExisted = false,
    relations: string[],
    transaction = getManager(),
  ) {
    const cart = await transaction
      .getRepository(Cart)
      .findOne({ where: { userId }, relations });

    if (!cart && throwErrorIfNotExisted) {
      throw new BadRequestException(messageKey.BASE.CART_NOT_FOUND);
    }
    return cart;
  }
}
