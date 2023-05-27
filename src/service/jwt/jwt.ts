import { configuration } from '../../config';
import jsonwebtoken from 'jsonwebtoken';
import { assign } from 'lodash';
import { ObjectLiteral } from 'typeorm';

export class Jwt {
  private static secret = configuration.jwt.secretKey;
  private static refreshSecret = configuration.jwt.refreshSecretKey;

  /** unit is second */
  private static ttl = 6 * 60 * 60; // Temporary set to 6hrs for dev

  static async issue(payload: ObjectLiteral) {
    // Default token expired after 1 year
    // TODO: implement multiple secret key by platform
    const ttl = this.ttl;
    const secret = this.secret;

    return jsonwebtoken.sign(
      assign(payload, {
        ttl,
      }),
      secret,
      {
        expiresIn: ttl,
      },
    );
  }

  static async issueRefreshToken(payload: ObjectLiteral) {
    return jsonwebtoken.sign(
      assign(payload, {
        ttl: this.ttl,
      }),
      this.refreshSecret,
      {
        expiresIn: this.ttl,
      },
    );
  }
}

export class JwtOptions {
  /** time to live, unit is second */
  ttl?: number;
}
