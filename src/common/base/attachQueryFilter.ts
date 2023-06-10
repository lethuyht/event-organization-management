import _, { isArray } from 'lodash';
import { FilterDto, QueryFilterDto } from '../dtos/queryFilter';

export function attachFilters(
  sourceFilter: QueryFilterDto,
  filters: FilterDto[],
) {
  if (isArray(sourceFilter.filters)) {
    sourceFilter.filters = sourceFilter.filters?.concat(filters);
  } else {
    sourceFilter.filters = filters;
  }

  return sourceFilter;
}
