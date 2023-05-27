import { ConnectionOptions } from 'typeorm';

export type EntitiesAndMigrationsOpts = Pick<
  ConnectionOptions,
  'entities' | 'migrations' | 'subscribers'
>;

export const loadEntitiesAndMigrations = () => {
  if (process.env.WEBPACK_RUNNER) {
    // eslint-disable-next-line no-undef
    const importAllFunctions = (
      requireContext: __WebpackModuleApi.RequireContext,
    ) =>
      requireContext
        .keys()
        .sort()
        .map((filename) => {
          const required = requireContext(filename);
          return Object.keys(required).reduce((result, exportedKey) => {
            const exported = required[exportedKey];
            if (typeof exported === 'function') {
              return result.concat(exported);
            }
            return result;
          }, [] as any);
        })
        .flat();

    const entitiesViaWebpack: NonNullable<
      EntitiesAndMigrationsOpts['entities']
    > = importAllFunctions(require.context('./entities/', true, /\.ts$/));
    // const subscribersViaWebpack: NonNullable<EntitiesAndMigrationsOpts['subscribers']> = importAllFunctions(
    //   require.context('./subscribers/', true, /\.ts$/)
    // );
    const migrationsViaWebpack: NonNullable<
      EntitiesAndMigrationsOpts['migrations']
    > = importAllFunctions(require.context('./migrations/', true, /\.ts$/));

    return {
      entities: entitiesViaWebpack,
      // subscribers: subscribersViaWebpack,
      migrations: migrationsViaWebpack,
    };
  }

  return {
    entities: [`${__dirname}/entities/*{.ts,.js}`],
    // subscribers: [__dirname + '/subcribers/*{.ts,.js}'],
    migrations: [`${__dirname}/migrations/*{.ts,.js}`],
  };
};
