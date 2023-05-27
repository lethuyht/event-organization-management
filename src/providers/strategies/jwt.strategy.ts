import { configuration } from '../../config';
import { Injectable } from '@nestjs/common';

import { JwtBaseStrategy } from './jwtBase.strategy';

@Injectable()
export class JwtStrategy extends JwtBaseStrategy {
  constructor() {
    super(configuration.jwt.secretKey);
  }
}
