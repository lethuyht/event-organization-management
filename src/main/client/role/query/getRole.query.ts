import { Role } from '@/db/entities/Role';
import { messageKey } from '@/i18n';
import { BadRequestException } from '@nestjs/common';
import { ILike } from 'typeorm';

export class GetRoleQuery {
  static async GetOneByName(name: string) {
    const role = await Role.findOne({ where: { name: ILike(`%${name}%`) } });

    if (!role) {
      throw new BadRequestException(messageKey.BASE.ROLE_NOT_FOUND);
    }

    return role;
  }
}
