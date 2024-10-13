import { injectable } from 'inversify';
import mongoose, { Document, FilterQuery, Model, QueryOptions, SaveOptions, UpdateQuery } from 'mongoose';

import { IPagination, IResponseList, Paginator } from '../utils/Paginator';

export interface BaseService<T extends Document> {
  create: (data: Partial<T>, options?: SaveOptions) => Promise<T>;
  createBatch: (documents: Partial<T>[]) => Promise<T[]>;
  findOneById: (id: string) => Promise<T | null>;
  findOne: (filter: FilterQuery<T>) => Promise<T | null>;
  findOneByIdAndUpdate: (
    id: mongoose.Types.ObjectId,
    data: UpdateQuery<T>,
    options?: QueryOptions,
  ) => Promise<T | null>;
  getAllWithPagination: (
    pagination: IPagination,
    query?: FilterQuery<T>,
    orderObject?: any,
    populated?: string[],
  ) => Promise<IResponseList<T>>;
  getAllAutoComplete: (query?: FilterQuery<T>, columns?: string[]) => Promise<T[]>;
  getAll: (query?: FilterQuery<T>) => Promise<T[]>;
  deleteOneById: (id: string, option?: QueryOptions<T>) => Promise<T | null>;
}

@injectable()
export class BaseServiceImpl<T extends Document> implements BaseService<T> {
  model!: Model<T>;

  async create(data: Partial<T>, options?: SaveOptions): Promise<T> {
    const document = new this.model(data);
    return await document.save(options);
  }

  async createBatch(documents: Partial<T>[]): Promise<T[]> {
    try {
      // Use Mongoose's insertMany for batch creation
      const results = (await this.model.insertMany(documents)) as any;
      return results;
    } catch (error) {
      // Handle or log error as needed
      throw new Error(`Error creating batch: ${(error as any).message}`);
    }
  }

  async findOneById(id: string): Promise<T | null> {
    const data = await this.model.findById(id);
    return data;
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    const data = await this.model.findOne(filter);
    return data;
  }

  async findOneByIdAndUpdate(
    id: mongoose.Types.ObjectId,
    data: UpdateQuery<T>,
    options?: QueryOptions,
  ): Promise<T | null> {
    const document = await this.model.findByIdAndUpdate(id, data, options).exec();
    return document;
  }

  async getAllAutoComplete(query: FilterQuery<T> = {}, columns = ['id', 'name']) {
    const filter: FilterQuery<T> = {};

    if (query) {
      Object.assign(filter, query);
    }

    const documents = await this.model.find(filter).select(columns).exec();
    return documents;
  }

  async getAllWithPagination(
    pagination: IPagination,
    query?: FilterQuery<T>,
    orderObject: any = {},
    populated: string[] = [],
  ): Promise<IResponseList<T>> {
    const { limit, offset } = pagination;
    const filter: FilterQuery<T> = {};
    Object.assign(orderObject, { startFrom: 1 });

    if (query) {
      Object.assign(filter, query);
    }

    const data = await this.model
      .find(filter)
      .populate(populated)
      .sort(orderObject)
      .skip(offset)
      .limit(limit)
      .exec();
    const total = await this.model.countDocuments(filter).exec();

    const response = await new Paginator<T>(data, total, offset, limit).paginate();
    return response;
  }

  async getAll(query?: FilterQuery<T>): Promise<T[]> {
    const response = await this.model.find({ ...query }).sort({ createdAt: -1 });
    return response;
  }

  async deleteOneById(id: string, option?: QueryOptions<T>): Promise<T | null> {
    const response = await this.model.findByIdAndDelete(id, option);
    return response;
  }
}
