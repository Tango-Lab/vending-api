import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { ITransaction, Transaction } from '../models/Transaction';

export interface PaymentService extends BaseService<ITransaction> {}

@injectable()
export class PaymentServiceImpl extends BaseServiceImpl<ITransaction> implements PaymentService {
  model = Transaction;

  constructor() {
    super();
  }
}
