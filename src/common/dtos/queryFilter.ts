import { Type } from 'class-transformer';
import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { QUERY_OPERATOR } from '../constant';

const filterDescription = `
- Filter equal: filters:[{field: "User.name", operator: eq, data: "Enouvo"}]
- Filter not equal: filters:[{field: "User.name", operator: neq, data: "Enouvo"}]
- Filter less than: filters:[{field: "User.age", operator: lt, data: 40}]
- Filter greater than: filters:[{field: "User.age", operator: gt, data: 40}]
- Filter less than and equal: filters:[{field: "User.age", operator: lte, data: 40}]
- Filter greater than and equal: filters:[{field: "User.age", operator: gte, data: 40}]
- Filter field in many choice: filters:[{field: "User.name", operator: in, data: "EnouvoSpace,Enosta"}]
- Filter field not in many choice: filters:[{field: "User.name", operator: nin, data: "EnouvoSpace,Enosta"}]
- Filter field by text: filters:[{field: "User.name", operator: like, data: "Enouvo"}]`;

const qDescription = `
- Query by text. Ex: q:"abcxyz"
`;

const paginationDescription = `
- Paginate with limit and offset. Ex: limit:10, page:1
`;

const orderByDescription = `
- Order by fields and order reverse use prefix "ASC or DESC". Ex: orderBy: "User.createdAt:DESC"
- Use NULLS_FIRST OR NULLS_LAST to determine where null value should be, Ex: orderBy: "User.createdAt:DESC:NULLS_FIRST"
`;

registerEnumType(QUERY_OPERATOR, {
  name: 'QUERY_OPERATOR',
});

@InputType()
export class FilterDto {
  @Field()
  field: string;

  @Field(() => QUERY_OPERATOR)
  operator: string;

  @Field({ nullable: true })
  data?: string;
}

@InputType()
export class QueryFilterDto {
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

  @Field({ nullable: true, description: qDescription })
  q?: string;

  @Field(() => [FilterDto], { nullable: true, description: filterDescription })
  filters?: FilterDto[];

  relations?: string[];
}
