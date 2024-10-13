import { Request } from 'express';
import { inject, injectable } from 'inversify';

import { ContextRequest, Controller, GET, NotFoundError, POST, PUT } from '../../packages';
import { IMachine } from '../models';
import { ProductService } from '../services';
import { Pagination } from '../utils/Pagination';

@Controller('/products')
@injectable()
export class ProductController {
  @inject('ProductService')
  productSv!: ProductService;

  @GET('/v1/list')
  async getAllProduct() {
    const user = await this.productSv.getAll();
    return user;
  }

  @GET('/v1/admin/list')
  async getAllProductForAdmin(@ContextRequest request: Request<any, any, IMachine>) {
    const { name, type } = request.query;
    const pagination = new Pagination(request).getParam();
    const filter = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    if (type) {
      Object.assign(filter, { type });
    }

    const lists = await this.productSv.getAllWithPagination(pagination, filter);
    return lists;
  }

  @GET('/v1/autocomplete')
  async getAllAutoMachine(@ContextRequest request: Request<any, any, IMachine>) {
    const { name } = request.query;
    const filter = { isActive: true };

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const lists = await this.productSv.getAllAutoComplete(filter, ['id', 'name', 'imageUrl']);
    return lists;
  }

  @GET('/v1/:id')
  async findOneById(@ContextRequest request: Request<any, any, IMachine>) {
    const { id } = request.params;
    const product = await this.productSv.findOneById(id);
    if (!product) {
      throw new NotFoundError('This Product does`t existed');
    }
    return product;
  }

  @PUT('/v1/:id')
  async updateMachine(@ContextRequest request: Request<any, any, IMachine>) {
    const { id } = request.params;
    const product = await this.productSv.findOneByIdAndUpdate(id, request.body);
    return product;
  }

  @POST('/v1/create')
  async createMachine(@ContextRequest request: Request) {
    const product = await this.productSv.create(request.body);
    return product;
  }

  @POST('/v1/create-batch')
  async createMachineBatch(@ContextRequest request: Request) {
    const products = await this.productSv.createBatch(request.body);
    return products;
  }
}
