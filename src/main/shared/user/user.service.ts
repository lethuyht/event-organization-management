import { Injectable } from '@nestjs/common';

import { ChangePasswordInput, UserUpdateInput } from './dto';
import { IUser } from './interface';
import { GetUserQuery } from './query/getUser.query';

import { ResponseMessageBase } from '@/common/interfaces/returnBase';
import { User } from '@/db/entities/User';
import { Context } from '@/decorators/user.decorator';
import { messageKey } from '@/i18n';
import { PasswordUtil } from '@/providers/password';
import { QueryFilterDto } from '@/common/dtos/queryFilter';
import { getPaginationResponse } from '@/common/base/getPaginationResponse';

@Injectable()
export class UserService {
  async getOne(id: string): Promise<IUser> {
    return await GetUserQuery.getOneById(id, true, ['role']);
  }

  async getAll(queryParams: QueryFilterDto) {
    const builder = User.createQueryBuilder('User').leftJoinAndSelect(
      'User.role',
      'role',
    );

    return await getPaginationResponse(builder, queryParams);
  }
  public async updateUser(
    userUpdateInput: UserUpdateInput,
    ctx: Context,
  ): Promise<IUser> {
    const { id } = ctx.currentUser;

    const user = await GetUserQuery.getOneById(id);

    const updated = await User.merge(user, {
      ...userUpdateInput,
      email: user.email,
    });

    await updated.save();

    return await GetUserQuery.getOneById(id, true, ['role']);
  }

  public async changePassword(
    changePasswordInput: ChangePasswordInput,
    ctx: Context,
  ): Promise<ResponseMessageBase> {
    const { password, newPassword } = changePasswordInput;
    const user = await GetUserQuery.getOneById(ctx.currentUser.id);

    await PasswordUtil.validateHash(password, user.password);

    user.password = await PasswordUtil.generateHash(newPassword);

    await user.save();

    return {
      success: true,
      message: messageKey.BASE.SUCCESSFULLY,
    };
  }
}
