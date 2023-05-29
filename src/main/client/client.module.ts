import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { join } from 'path';
import { UploadModule } from '../shared/upload/upload.module';
import { AuthClientModule } from './auth/auth.module';

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
      include: [UploadModule, AuthClientModule],
    }),
    UploadModule,
    AuthClientModule,
  ],
})
export class ClientModule {}
