import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { RoleModule } from './role/role.module';
import { AuthAdminModule } from './auth/auth.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/admin',
      autoSchemaFile: join(process.cwd(), 'schemaAdmin.gql'),
      sortSchema: true,
      formatError: (error: GraphQLError) => {
        const graphQLFormattedError: any = {
          statusCode: error.extensions?.exception?.code || 500,
          message: error.message,
        };
        return graphQLFormattedError;
      },
      include: [RoleModule, AuthAdminModule],
    }),
    RoleModule,
    AuthAdminModule,
  ],
})
export class AdminModule {}
