import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ObjectLiteral } from 'typeorm';

export abstract class JwtBaseStrategy extends PassportStrategy(Strategy) {
  constructor(secretKey: string) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secretKey,
    });
  }

  async validate(payload: ObjectLiteral): Promise<unknown> {
    // TODO: Validate user and set user context
    console.log('Validate jwt strategy');

    return payload;
  }
}
