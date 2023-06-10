import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { UploadModule } from '../shared/upload/upload.module';
import { AuthClientModule } from './auth/auth.module';
import { UserModule } from '../shared/user/user.module';
import { EventModule } from './event/event.module';
import { RoleModule } from './role/role.module';
import { ServiceModule } from './service/service.module';
import { CartModule } from './cart/cart.module';
import { ContractModule } from './contract/contract.module';
import { EventRequestModule } from './eventRequest/eventRequest.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/client',
      autoSchemaFile: join(process.cwd(), 'schemaClient.gql'),
      sortSchema: true,
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError: any = {
          statusCode: error.extensions?.exception?.code || 500,
          message: error.message,
        };
        return graphQLFormattedError;
      },
      include: [
        UploadModule,
        AuthClientModule,
        RoleModule,
        UserModule,
        EventModule,
        ServiceModule,
        CartModule,
        ContractModule,
        EventRequestModule,
      ],
    }),
    UploadModule,
    AuthClientModule,
    RoleModule,
    UserModule,
    EventModule,
    ServiceModule,
    CartModule,
    ContractModule,
    EventRequestModule,
  ],
})
export class ClientModule {}
