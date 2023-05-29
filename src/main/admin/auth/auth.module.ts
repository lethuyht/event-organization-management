import { Module } from '@nestjs/common';
import { AuthAdminResolver } from './auth.resolver';
import { AuthClientService } from '@/main/client/auth/auth.service';

@Module({
  providers: [AuthAdminResolver, AuthClientService],
})
export class AuthAdminModule {}
