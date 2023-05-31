import { SelectQueryBuilder } from 'typeorm';
import { QueryFilterDto } from '../dtos/queryFilter';

export const getPaginationResponse = async (
  builder: SelectQueryBuilder<any>,
  queryParams: QueryFilterDto,
) => {
  const { limit, page, orderBy } = queryParams;
  const offset = (page - 1) * limit;

  if (orderBy) {
    addOrderByQuery(builder, orderBy);
  }

  builder.skip(offset).take(limit);

  const [items, count] = await builder.getManyAndCount();

  const meta = {
    totalItems: count,
    itemCount: items.length,
    itemsPerPage: limit,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
  };

  return { items, meta };
};

export const addOrderByQuery = (
  builder: SelectQueryBuilder<any>,
  orderBy: string,
) => {
  const field = orderBy.split(':')[0];
  const sortBy = orderBy.split(':')[1].toUpperCase() as 'DESC' | 'ASC';
  const nulls = String(orderBy.split(':')[2])
    .replace('_', ' ')
    .toUpperCase() as 'NULLS FIRST' | 'NULLS LAST';

  if (['ASC', 'DESC'].includes(sortBy)) {
    if (['NULLS FIRST', 'NULLS LAST'].includes(nulls)) {
      builder.orderBy(`${field}`, sortBy, nulls);

      return builder;
    }

    builder.orderBy(`${field}`, sortBy);
  }

  return builder;
};
