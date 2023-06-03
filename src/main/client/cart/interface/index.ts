import { Cart } from '@/db/entities/Cart';
import { ObjectType } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export class ICart extends Cart {}
