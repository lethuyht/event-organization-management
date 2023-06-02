import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { UploadModule } from '../shared/upload/upload.module';
import { AuthClientModule } from './auth/auth.module';
<<<<<<< Updated upstream
import { RoleModule } from '../admin/role/role.module';
import { UserModule } from '../shared/user/user.module';
import { EventModule } from './event/event.module';
=======
import { RoleModule } from './role/role.module';
import { ServiceModule } from './service/service.module';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
      include: [
        UploadModule,
        AuthClientModule,
        RoleModule,
        UserModule,
        EventModule,
      ],
=======
      include: [UploadModule, AuthClientModule, RoleModule, ServiceModule],
>>>>>>> Stashed changes
    }),
    UploadModule,
    AuthClientModule,
    RoleModule,
<<<<<<< Updated upstream
    UserModule,
    EventModule,
=======
    ServiceModule,
>>>>>>> Stashed changes
  ],
})
export class ClientModule {}
