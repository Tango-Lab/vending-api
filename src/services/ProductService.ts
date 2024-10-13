import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import Product, { IProduct } from '../models/Products';

export interface ProductService extends BaseService<IProduct> {}

@injectable()
export class ProductServiceImpl extends BaseServiceImpl<IProduct> implements ProductService {
  model = Product;

  constructor() {
    super();
  }
}
