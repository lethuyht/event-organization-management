import { Field, ObjectType } from '@nestjs/graphql';
@ObjectType({ isAbstract: true })
export class MetaPaginationInterface {
  @Field()
  totalItems: number;

  @Field()
  itemCount: number;

  @Field()
  itemsPerPage: number;

  @Field()
  totalPages: number;

  @Field()
  currentPage: number;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function PaginationInterface<ItemsInterface>(Items: any): any {
  @ObjectType({ isAbstract: true })
  abstract class PaginationInterface {
    @Field(() => MetaPaginationInterface)
    meta: MetaPaginationInterface;

    @Field(() => [Items])
    items: ItemsInterface[];
  }
  return PaginationInterface;
}
