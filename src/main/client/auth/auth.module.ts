import { Module } from '@nestjs/common';
import { AuthClientResolver } from './auth.resolver';
import { AuthClientService } from './auth.service';
import { EmailService } from '@/service/smtp/service';

@Module({
  providers: [AuthClientResolver, AuthClientService, EmailService],
})
export class AuthClientModule {}
