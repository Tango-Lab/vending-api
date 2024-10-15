import * as express from 'express';
import { inject, injectable } from 'inversify';
import { ClientSession } from 'mongoose';

import {
  BadRequestError,
  ContextRequest,
  Controller,
  GET,
  Middleware,
  NotFoundError,
  POST,
} from '../../packages';
import { TransactionManager } from '../base/TransactionManager';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { TransactionStatus } from '../enums/Transaction';
import { ExpressHelper } from '../helpers';
import { GenericParamsChecker, ValidationRulesMap } from '../helpers/ValidationParamHelper';
import { IPaymentParam, IPaymentStatusParam, validatePaymentParam } from '../middlewares/Payments';
import {
  BakongService,
  MachineSlotService,
  OrderService,
  PaymentService,
  TransactionService,
} from '../services';

@Controller('/payments')
@injectable()
export class PaymentController {
  @inject('OrderService')
  orderSv!: OrderService;

  @inject('PaymentService')
  paymentSv!: PaymentService;

  @inject('TransactionService')
  transactionSv!: TransactionService;

  @inject('BakongService')
  bakongSv!: BakongService;

  @inject('MachineSlotService')
  machineSlotSv!: MachineSlotService;

  @GET('/v1/:transactionNo/status')
  @Middleware(validatePaymentParam)
  async getQRCodeStatus() {
    return { message: 'To do Bakong QRCode Confirm Paid' };
  }

  @POST('/v1/qrcode')
  @Middleware(validatePaymentParam)
  async generatePaymentQRCode(@ContextRequest request: express.Request<any, any, IPaymentParam>) {
    const ip = ExpressHelper.getClientIp(request);
    const { orderNo, orderId, machine } = request.body;
    const order = await this.orderSv.findOne({
      orderNo,
      machine,
      _id: orderId,
      orderStatus: OrderStatus.Pending,
    });
    if (!order) {
      throw new NotFoundError('We don`t have this order yet.!');
    }
    const payments = await this.transactionSv.createBakongPayment(order, request.body, ip);
    const response = {
      id: payments.id,
      qrCode: payments.hashBakongCode,
      metaData: payments.paymentMetadata,
      amount: payments.amount,
      transactionNo: payments.transactionNo,
      currency: payments.currency,
      createdAt: payments.createdAt,
    };
    return response;
  }

  @POST('/v1/confirm')
  async confirmQRPaid() {
    return { message: 'To do Bakong QRCode Confirm Paid' };
  }

  @POST('/v1/status')
  async checkTransactionStatus(
    @ContextRequest request: express.Request<any, any, IPaymentStatusParam>,
  ) {
    const rules: ValidationRulesMap<IPaymentStatusParam> = {
      transactionId: { isRequired: true, isObjectId: true },
    };
    const param = new GenericParamsChecker(request, rules).getParams();

    const transaction = await this.transactionSv.findOne({
      _id: param.transactionId,
    });
    if (!transaction) {
      throw new NotFoundError(
        'We don`t have this transaction.',
        ErrorCode.TransactionDoesNotExisted,
      );
    }

    if (transaction.status === TransactionStatus.Completed) {
      throw new BadRequestError(
        'Payment for this transaction has been successfully processed.',
        ErrorCode.TransactionHaveCompleted,
      );
    }

    const order = await this.orderSv.findOneById(transaction.order._id as any);
    if (!order) {
      throw new NotFoundError('This order does not existed', ErrorCode.OrderItemDoesNotExisted);
    }

    const bakong = await this.bakongSv.checkAccountStatus(transaction.paymentMetadata);
    if (!bakong.data) {
      throw new NotFoundError(
        'This Transaction have`t completed yet.',
        ErrorCode.TransactionHaveNotCompletedYet,
      );
    }

    const paymentData = bakong.data;
    const result = await new TransactionManager().runs(async (session: ClientSession) => {
      const result = await this.transactionSv.singTransactionIsCompleted(
        transaction.id,
        paymentData,
        session,
      );
      await this.orderSv.signOrderCompleted(order.id, session);
      await this.machineSlotSv.updateAvailableQuantity(order.machine as any, order.items, session);
      return result;
    });

    const response = {
      orderId: transaction.order,
      transactionNo: transaction.transactionNo,
      createdAt: transaction.createdAt,
      amount: transaction.amount,
      paymentTimestamp: transaction.paymentTimestamp,
      currency: result.currency,
      status: result.status,
    };

    return response;
  }
}
