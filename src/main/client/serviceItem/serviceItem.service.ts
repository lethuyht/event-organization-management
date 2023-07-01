import { ServiceItem } from '@/db/entities/ServiceItem';
import { messageKey } from '@/i18n';
import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ServiceItemService {
  async deleteServiceItem(id: string) {
    const serviceItem = await ServiceItem.findOne({ id });

    if (!serviceItem || serviceItem.isUsed) {
      throw new BadRequestException(
        'Service item không tìm thấy hoặc đã được sử dụng !',
      );
    }

    await ServiceItem.remove(serviceItem);
    return { message: messageKey.BASE.SUCCESSFULLY, success: true };
  }
}
