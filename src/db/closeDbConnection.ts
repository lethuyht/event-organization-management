import { getConnection } from 'typeorm';

export const closeDatabaseConnection = async (): Promise<void> => {
  const connection = getConnection();
  if (connection.isConnected) {
    await connection.close();
  }
};
