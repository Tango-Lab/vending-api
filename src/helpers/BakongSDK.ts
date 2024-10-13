import { COUNTRY, CURRENCY, KHQR, QRPayload, ResponseResult, ReturnType, TAG } from 'ts-khqr';

import { BadRequestError } from '../../packages';
import { Currency as ECurrency } from '../enums/Currency';

export interface IPaymentSDK {
  amount: number;
  transactionNo: string;
  currency: ECurrency;
}

export class BakongPaymentSDK {
  readonly #info: IPaymentSDK;

  readonly #accountName: string;
  readonly #accountID: string;

  constructor(info: IPaymentSDK) {
    if (!process.env.BAKONG_ACCOUNT_NAME) {
      throw new BadRequestError('Missing `BAKONG_ACCOUNT_NAME` in environment variables.');
    }
    if (!process.env.BAKONG_ACCOUNT_ID) {
      throw new BadRequestError('Missing `BAKONG_ACCOUNT_ID` in environment variables.');
    }
    if (info.amount <= 0) {
      throw new BadRequestError('Amount to paid cant be less than 0.');
    }
    //
    this.#accountName = process.env.BAKONG_ACCOUNT_NAME;
    this.#accountID = process.env.BAKONG_ACCOUNT_ID;
    this.#info = info;
  }

  generateKHQR(): ReturnType<ResponseResult | null> {
    const optionalData: QRPayload = {
      tag: TAG.INDIVIDUAL,
      accountID: this.#accountID,
      merchantName: this.#accountName,
      currency: this.#getCurrency(),
      amount: this.#info.amount,
      countryCode: COUNTRY.KH, // default KH
      additionalData: {
        billNumber: this.#info.transactionNo,
        mobileNumber: process.env.BAKONG_PHONE_NUMBER ?? '855 23 994 444',
        terminalLabel: this.#accountName,
        storeLabel: this.#accountName,
      },
    };

    return KHQR.generate(optionalData);
  }

  #getCurrency(): string {
    if (this.#info.currency === 'USD') {
      return CURRENCY.USD;
    }
    return CURRENCY.KHR;
  }
}
