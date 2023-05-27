import { CACHE_NAMESPACE, RedisClientSingleton } from '../service/aws/redis';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { isNil } from 'lodash';
import uniq from 'lodash/uniq';
import { getManager } from 'typeorm';

@ValidatorConstraint({})
export class EntityExistingValidator implements ValidatorConstraintInterface {
  async validate(
    input: (string | number) | (string | number)[],
    args: ValidationArguments,
  ) {
    if (isNil(input)) {
      return true;
    }

    if (!args.constraints?.length) {
      return false;
    }

    const entityIds = Array.isArray(input) ? uniq(input) : [input];
    const repository = args.constraints[0];

    const totalExistingEntities = await RedisClientSingleton.getInstance().get(
      `${CACHE_NAMESPACE.Entity}-${repository}-`,
      entityIds.join(),
      async () =>
        await getManager()
          .getRepository(repository)
          .createQueryBuilder()
          .whereInIds(entityIds)
          .getCount(),
    );

    return totalExistingEntities == entityIds.length;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.constraints?.[0]} is not found.`;
  }
}
