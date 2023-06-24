import { BadRequestException, Injectable } from '@nestjs/common';
import { AddItemToCartDto } from './dto';
import { ValidateCartItem } from './command/validateCartItem.command';
import { CartItem } from '@/db/entities/CartItem';
import { Cart } from '@/db/entities/Cart';
import { messageKey } from '@/i18n';
import { User } from '@/db/entities/User';
import { GraphQLResolveInfo } from 'graphql';
import { CONTRACT_STATUS } from '@/db/entities/Contract';

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
      cartId: cart.id,
      isValidateCart: true,
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

  async getMyCart(userId: string, info: GraphQLResolveInfo) {
    const cart = await Cart.createQueryBuilder()
      .where({ userId })
      .leftJoinAndSelect('Cart.cartItems', 'cartItem')
      .leftJoinAndSelect('cartItem.serviceItem', 'serviceItem')
      .leftJoinAndSelect('serviceItem.service', 'service')
      .addSelect(
        `
        CASE 
          WHEN ((SELECT COALESCE(SUM("contract_service_item"."amount"), 0)
                  FROM "contract_service_item" LEFT JOIN "contract" ON "contract"."id" = "contract_service_item"."contract_id"
                  WHERE "contract_service_item"."service_item_id" = "cartItem"."service_item_id" AND ("contract_service_item"."hire_date", "contract_service_item"."hire_end_date") OVERLAPS ("cartItem"."hire_date", "cartItem"."hire_end_date")
                  AND "contract"."status" NOT IN ('${CONTRACT_STATUS.AdminCancel}', '${CONTRACT_STATUS.Cancel}'))
              + 
                  (SELECT COALESCE(SUM("contract_event_service_item"."amount"), 0) FROM "contract_event_service_item" LEFT JOIN "contract_event" ON "contract_event"."id" = "contract_event_service_item"."contract_event_id"
                  LEFT JOIN "contract" ON "contract"."id" = "contract_event"."contract_id"
                  WHERE "contract_event_service_item"."service_item_id" = "cartItem"."service_item_id" 
                  AND ("contract"."hire_date", "contract"."hire_end_date") OVERLAPS ("cartItem"."hire_date", "cartItem"."hire_end_date")
                  AND "contract"."status" NOT IN ('${CONTRACT_STATUS.AdminCancel}', '${CONTRACT_STATUS.Cancel}')))
             + "cartItem"."amount" <= "serviceItem"."total_quantity"
            THEN TRUE
            ELSE FALSE
        END`,
        'cartItem_is_available',
      )
      .getOne();

    return cart;
  }
}
