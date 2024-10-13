import { Document } from 'mongoose';

import { BadRequestError } from '../../packages';
import { ResponseList } from '../classes/ResponseList';

export interface IPagination {
  offset: number;
  limit: number;
}

export interface IResponseList<T> {
  data: T[];
  total: number;
  count: number;
  offset: number;
  limit: number;
  hasNext: boolean;
}

export class Paginator<T extends Document> {
  #data: T[] = [];
  #total = 0;
  #offset = 0;
  #limit = 0;

  constructor(data: T[] = [], total = 0, offset = 0, limit = 25) {
    if (offset < 0 || limit < 0) {
      throw new BadRequestError('`Offset` and `Limit` must be positive integers');
    }
    //
    this.#data = data;
    this.#total = total;
    this.#offset = offset;
    this.#limit = limit;
  }

  public async paginate(): Promise<IResponseList<T>> {
    return new ResponseList(this.#data, this.#total, this.#offset, this.#limit).toJSON();
  }
}
