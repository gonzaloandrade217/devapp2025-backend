import { UUID } from './UUID'; 

export type WithTransientId<T> = T & {
  _id: UUID;
};