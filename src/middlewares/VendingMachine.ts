import * as express from 'express';

import { BadRequestError } from '../../packages';
import { MAX_PER_ORDER, MAX_QUANTITY } from '../constants';
import { OrderStatus } from '../enums/Order';
import { OrderRequestParams } from '../helpers';
import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';
import { OrderServiceImpl } from '../services';

export function validateOrderParam(
  req: express.Request<any, any, OrderRequestParams>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const rules: ValidationRulesMap<OrderRequestParams> = {
      machine: { isRequired: true, isObjectId: true, type: 'string' },
      serialNo: { isRequired: true, type: 'string' },
      note: { isRequired: false, type: 'string' },
      products: {
        isArray: true,
        minLength: 1,
        maxLength: MAX_PER_ORDER,
        itemRules: {
          id: { isRequired: true, isObjectId: true, type: 'string' },
          quantity: {
            isRequired: true,
            type: 'number',
            isPositiveInteger: true,
            maxQuantity: MAX_QUANTITY,
          },
          slotNo: { isRequired: true, type: 'string' },
        },
      },
    };
    new GenericParamsChecker(req, rules);
    next();
  } catch (error) {
    next(error);
  }
}

export function validateCancelOrderParam(
  req: express.Request<any, any, OrderRequestParams>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const rules: ValidationRulesMap<any> = {
      machine: { isRequired: true, isObjectId: true, type: 'string' },
      serialNo: { isRequired: true, type: 'string' },
      orderNo: { isRequired: true, type: 'string' },
    };
    new GenericParamsChecker(req, rules);
    next();
  } catch (error) {
    next(error);
  }
}

export async function ensureVendingMachineIsAvailable(
  req: express.Request<any, any, OrderRequestParams>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const orderService = new OrderServiceImpl();
    const { machine, serialNo } = req.body;

    const machineIsStillPending = await orderService.findOne({
      machine,
      serialNo,
      orderStatus: OrderStatus.Pending,
    });
    if (machineIsStillPending) {
      throw new BadRequestError('Payment for this vending machine has not been completed yet');
    }

    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyPurchaseBeforePayment(
  req: express.Request<any, any, OrderRequestParams>,
  _R: express.Response,
  next: express.NextFunction,
) {
  try {
    const orderService = new OrderServiceImpl();
    const { machine, serialNo } = req.body;

    const order = await orderService.findOne({
      machine,
      serialNo,
      orderStatus: OrderStatus.Pending,
    });
    if (!order) {
      throw new BadRequestError('You must purchase an item before completing the payment for this vending machine');
    }
    req.orderId = order.id;

    next();
  } catch (error) {
    next(error);
  }
}
