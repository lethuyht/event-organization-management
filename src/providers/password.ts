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
    validatedByGoogle = false,
    errorMessageIfNotMatched?: string,
  ) {
    if (!hash && validatedByGoogle) {
      return true;
    }

    const isMatched = await bcryptjs.compare(password, hash);

    if (!isMatched && throwErrorIfNotMatch) {
      throw new BadRequestException(
        errorMessageIfNotMatched ?? 'Email or password is incorrect.',
      );
    }

    if (isMatched && !throwErrorIfNotMatch) {
      throw new BadRequestException(
        "You can't use the same password as the current one.",
      );
    }
  }
}
