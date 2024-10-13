export class ResponseList<T> {
  data: T[];
  total = 0;
  offset = 0;
  limit = 0;
  hasNext: boolean;

  constructor(data: T[] = [], total: number = data.length, limit = 0, offset = 0) {
    this.data = data;
    this.total = total;
    this.offset = offset;
    this.limit = limit;
    this.hasNext = this.offset + this.limit < this.total;
  }

  toJSON() {
    return {
      data: this.data,
      total: this.total,
      count: this.data.length,
      offset: this.offset,
      limit: this.limit,
      hasNext: this.hasNext,
    };
  }

  promise(): Promise<ResponseList<T>> {
    return new Promise((resolve) => {
      resolve(this);
    });
  }
}
