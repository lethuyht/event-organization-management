import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ormconfig } from '../db/ormconfig';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        const dbConfig = await ormconfig();
        return {
          ...dbConfig,
          keepConnectionAlive: true,
          logging: true,
          migrationsRun: true,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
