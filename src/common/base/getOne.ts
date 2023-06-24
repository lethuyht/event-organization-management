import { NotFoundException } from '@nestjs/common';
import { GraphQLResolveInfo } from 'graphql';
import { getManager } from 'typeorm';
import { CustomBaseEntity } from './baseEntity';

export const getOneBase = async (
  entity: typeof CustomBaseEntity,
  id: string,
  throwErrorIfNotExist = true,
  info?: GraphQLResolveInfo,
  vietnameseEntityName?: string,
  transaction = getManager(),
) => {
  const relations = info ? entity.getRelations(info) : [];

  const result = await transaction.getRepository(entity).findOne({
    where: {
      id,
    },
    relations,
  });

  if (!result && throwErrorIfNotExist) {
    throw new NotFoundException(
      vietnameseEntityName
        ? `Không tìm thấy ${vietnameseEntityName}.`
        : `${entity.name} not found.`,
    );
  }
  return result;
};
