import { APP_ENV } from '../common/constant';
import { configuration } from './../config/index';

export const applyEmailSubjectByEnvironment = (subject) => {
  const env = configuration.api.nodeEnv;
  return env.toLowerCase() === APP_ENV.RELEASE
    ? subject
    : `[TEST ONLY - ${env.toUpperCase()}] ${subject}`;
};
