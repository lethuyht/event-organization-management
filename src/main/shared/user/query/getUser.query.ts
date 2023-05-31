import { User } from '@/db/entities/User';
import { messageKey } from '@/i18n';
import { BadRequestException } from '@nestjs/common';

export class GetUserQuery {
  static async getOneByEmail(
    email: string,
    throwErrorIfNotExists = true,
    relations?: string[],
  ) {
    const user = await User.findOne({ where: { email }, relations });

    if (!user && throwErrorIfNotExists) {
      throw new BadRequestException(messageKey.BASE.ACCOUNT_NOT_EXIST);
    }

    return user;
  }

  static async getOneById(
    userId: string,
    throwErrorIfNotExists = true,
    relations?: string[],
  ) {
    const user = await User.findOne({
      where: { id: userId },
      relations: relations,
    });

    if (!user && throwErrorIfNotExists) {
      throw new BadRequestException(messageKey.BASE.ACCOUNT_NOT_EXIST);
    }

    return user;
  }
}
