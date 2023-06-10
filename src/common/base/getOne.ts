import { GraphQLResolveInfo } from 'graphql';
import { CustomBaseEntity } from './baseEntity';
import { getRepository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export const getOneBase = async (
  entity: typeof CustomBaseEntity,
  id: string,
  throwErrorIfNotExist = true,
  info?: GraphQLResolveInfo,
  vietnameseEntityName?: string,
) => {
  const relations = info ? entity.getRelations(info) : [];

  const result = await getRepository(entity).findOne({
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
};
