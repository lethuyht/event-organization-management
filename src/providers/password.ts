import { configuration } from '../config';
import { BadRequestException } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

export class PasswordUtil {
  static async generateHash(password: string): Promise<string> {
    return await bcryptjs.hash(password, Number(configuration.bcrypt.salt));
  }

  static async validateHash(
    password: string,
    hash: string,
    throwErrorIfNotMatch = true,
  ) {
    if (!hash) {
      return true;
    }

    const isMatched = await bcryptjs.compare(password, hash);

    if (!isMatched && throwErrorIfNotMatch) {
      throw new BadRequestException('Tên đăng nhập hoặc mật khẩu không đúng.');
    }
  }
}
