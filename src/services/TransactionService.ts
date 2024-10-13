import { inject, injectable } from 'inversify';
import { ClientSession } from 'mongoose';
import { ResponseResult } from 'ts-khqr';

import { BadRequestError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import { Currency } from '../enums/Currency';
import { PaymentMethod } from '../enums/Order';
import { TransactionStatus, TransactionType } from '../enums/Transaction';
import { BakongPaymentSDK } from '../helpers/BakongSDK';
import { IPaymentParam } from '../middlewares/Payments';
import { IOrder } from '../models';
import { AccountTransactionData } from '../models/SitAPI';
import { ITransaction, Transaction } from '../models/Transaction';
import { SerialPrefixService } from './SerialPrefixService';

export interface TransactionService extends BaseService<ITransaction> {
  createBakongPayment: (order: IOrder, bodyParam: Partial<IPaymentParam>, ip: string) => Promise<ITransaction>;
  singTransactionIsCompleted: (
    trxId: string,
    paymentInfo: AccountTransactionData,
    session?: ClientSession,
  ) => Promise<ITransaction>;
}

@injectable()
export class TransactionServiceImpl extends BaseServiceImpl<ITransaction> {
  model = Transaction;

  @inject('SerialPrefixService')
  prefixSv!: SerialPrefixService;

  constructor() {
    super();
  }

  async singTransactionIsCompleted(trxId: string, paymentInfo: AccountTransactionData, session?: ClientSession) {
    const info: Partial<ITransaction> = {
      status: TransactionStatus.Completed,
      paymentInfo,
      paymentTimestamp: new Date(),
    };
    const transaction = await Transaction.findByIdAndUpdate(trxId, info, {
      session,
      new: true,
    });
    return transaction;
  }

  async createBakongPayment(order: IOrder, bodyParam: IPaymentParam, ip: string): Promise<ITransaction> {
    const result = await new TransactionManager().runs(async (session) => {
      const { note } = bodyParam;
      const { prefixCode } = await this.prefixSv.retrieveOrGenerateSerialPrefix('Transaction', 'T', session);
      const bakong = new BakongPaymentSDK({
        transactionNo: prefixCode,
        amount: order.totalAmount,
        currency: order.currency ?? Currency.KHR,
      });
      const qrCode = bakong.generateKHQR();
      if (!qrCode?.data?.md5 || !qrCode?.data?.qr) {
        throw new BadRequestError('KHQR can`t generated.');
      }
      let payment: Partial<ITransaction> = {
        order: order._id,
        amount: order.totalAmount,
        currency: order.currency,
        note: note,
        paymentReference: note,
        paymentMethod: PaymentMethod.QRCode,
        paymentProvider: 'Bakong Payment',
        ip: ip,
        transactionNo: prefixCode,
        hashBakongCode: (qrCode.data as ResponseResult).qr,
        paymentMetadata: (qrCode.data as ResponseResult).md5,
        transactionType: TransactionType.Payment,
        status: TransactionStatus.Pending,
      };
      payment = await new Transaction(payment).save({ session });
      return payment;
    });
    return result as ITransaction;
  }
}
