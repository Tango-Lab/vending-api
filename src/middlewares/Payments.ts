import * as express from 'express';
import mongoose from 'mongoose';

import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';

export interface IPaymentStatusParam {
  transactionId: mongoose.Schema.Types.ObjectId;
}

export interface IPaymentParam {
  orderId: mongoose.Schema.Types.ObjectId;
  machine: mongoose.Schema.Types.ObjectId;
  orderNo: string;
  serialNo: string;
  note: string;
}

export function validatePaymentParam(
  req: express.Request<any, any, IPaymentParam>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const rules: ValidationRulesMap<IPaymentParam> = {
      machine: { isRequired: true, isObjectId: true, type: 'string' },
      orderId: { isRequired: true, isObjectId: true, type: 'string' },
      serialNo: { isRequired: true, type: 'string' },
      orderNo: { isRequired: true, type: 'string' },
      note: { isRequired: true, type: 'string', allowNull: true },
    };
    new GenericParamsChecker(req, rules);
    next();
  } catch (error) {
    next(error);
  }
}
