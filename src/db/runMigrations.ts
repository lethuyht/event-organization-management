import { configuration } from '../config';
import { ConnectToDb } from './connectToDb';

export const runMigrations = async () => {
  const connectToDb = new ConnectToDb();
  const connection = await connectToDb.getConnection();
  return await connection.runMigrations({ transaction: 'all' });
};

const main = async () => {
  const nodeEnv = process.argv[3] ? process.argv[3] : configuration.api.nodeEnv;
  const connectToDb = new ConnectToDb();
  const connection = await connectToDb.getConnection('default', nodeEnv);
  if (process.argv[2] === 'apply') {
    await connection.runMigrations({ transaction: 'all' });
  }
  if (process.argv[2] === 'revert') {
    await connection.undoLastMigration({ transaction: 'all' });
  }
};
main();
