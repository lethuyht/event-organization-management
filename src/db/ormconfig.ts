import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { APP_ENV } from '../common/constant';
import { configuration } from '../config';
import { loadEntitiesAndMigrations } from './entities-migrations-loader';

export const ormconfig = async (hardCodeEnv?: string) => {
  const nodeEnv = hardCodeEnv ? hardCodeEnv : configuration.api.nodeEnv;

  let typeOrmConfig: ConnectionOptions = {
    ...loadEntitiesAndMigrations(),
    type: 'postgres',
    cli: {
      migrationsDir: 'migrations',
      entitiesDir: 'entities',
    },
    namingStrategy: new SnakeNamingStrategy(),
    extra: {
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 10000,
    },
  };
  if (nodeEnv === APP_ENV.TEST) {
    typeOrmConfig = {
      ...typeOrmConfig,
      url: configuration.databaseTest,
    };
  }
  if (nodeEnv === APP_ENV.LOCAL) {
    typeOrmConfig = {
      ...typeOrmConfig,
      url: configuration.databaseLocal,
    };
  }
  if ([APP_ENV.STAGING, APP_ENV.UAT, APP_ENV.RELEASE].includes(nodeEnv)) {
    /* Get uri connect to db cloud - dev & uat & release environment */
    typeOrmConfig = {
      ...typeOrmConfig,
      url: configuration.connectionString,
    };
  }

  return typeOrmConfig;
};
