import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthClientService } from './auth.service';
import { ResponseMessageBase } from '@/base/interface';
import {
  CodeVerifyDto,
  RefreshTokenDto,
  SignInDto,
  SignOutDto,
  SignUpDto,
} from './dto';
import { LoginResponse, RefreshResponse } from './interface';

@Resolver()
export class AuthClientResolver {
  constructor(private service: AuthClientService) {}

  @Mutation(() => ResponseMessageBase, { name: 'signUp' })
  signUp(@Args('input') input: SignUpDto) {
    return this.service.signUp(input);
  }

  @Mutation(() => LoginResponse, { name: `verifyCode` })
  async verifyCode(@Args('input') input: CodeVerifyDto) {
    return await this.service.verifyCode(input);
  }

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
