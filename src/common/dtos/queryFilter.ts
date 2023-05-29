import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';

const paginationDescription = `
- Paginate with limit and offset. Ex: limit:10, page:1
`;

const orderByDescription = `
- Order by fields and order reverse use prefix "ASC or DESC". Ex: orderBy: "User.createdAt:DESC"
- Use NULLS_FIRST OR NULLS_LAST to determine where null value should be, Ex: orderBy: "User.createdAt:DESC:NULLS_FIRST"
`;

@InputType()
export class QueryFilter {
  @Field({ defaultValue: 1, description: paginationDescription })
  page: number;

  @Field({
    nullable: true,
    defaultValue: 10,
    description: paginationDescription,
  })
  @Type(() => Number)
  limit: number;

  @Field({ nullable: true, description: orderByDescription })
  orderBy?: string;
}
