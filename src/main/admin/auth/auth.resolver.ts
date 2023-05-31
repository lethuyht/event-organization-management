import { ResponseMessageBase } from '@/base/interface';
import { AuthClientService } from '@/main/client/auth/auth.service';
import { RefreshTokenDto, SignInDto, SignOutDto } from '@/main/client/auth/dto';
import { LoginResponse, RefreshResponse } from '@/main/client/auth/interface';
import { Args, Resolver, Mutation } from '@nestjs/graphql';

@Resolver()
export class AuthAdminResolver {
  constructor(private service: AuthClientService) {}

  @Mutation(() => LoginResponse, { name: `signIn` })
  async signIn(@Args('input') input: SignInDto) {
    return await this.service.signIn(input);
  }

  @Mutation(() => ResponseMessageBase, { name: `signOut` })
  async signOut(@Args('input') input: SignOutDto) {
    return await this.service.signOut(input);
  }

  @Mutation(() => RefreshResponse, { name: `refreshToken` })
  async refreshToken(@Args('input') input: RefreshTokenDto) {
    return await this.service.refreshToken(input);
  }
}
