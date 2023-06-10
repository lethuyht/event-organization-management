import { Contract } from '@/db/entities/Contract';
import { BadRequestException } from '@nestjs/common';

export class ContractQueryCommand {
  static async getOneById(
    id: string,
    throwIfNotExisted = false,
    relations: string[],
  ) {
    const contract = await Contract.findOne({ where: { id }, relations });
    if (!contract && throwIfNotExisted) {
      throw new BadRequestException('Hợp đồng không được tìm thấy');
    }
    return contract;
  }
}
