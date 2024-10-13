import * as express from 'express';

import { BadRequestError } from '../../packages';

export class Pagination {
  #limit = 0;
  #offset = 0;

  constructor(request: express.Request) {
    const query = request.query;
    //
    this.#offset = parseInt(query.offset as string) || 0;
    this.#limit = parseInt(query.limit as string) || 25;

    if (this.#offset < 0 || this.#limit < 0) {
      throw new BadRequestError('`Offset` and `Limit` must be positive integers');
    }
  }

  getParam() {
    return {
      limit: this.#limit,
      offset: this.#offset,
    };
  }
}
