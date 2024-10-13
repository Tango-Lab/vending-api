import { Schema } from 'mongoose';

export interface GenericResponse<T> {
  data: T;
  errorCode: number | null;
  responseCode: number;
  responseMessage: string;
}

export interface RenewTokenData {
  token: string;
}

export interface AccountTransactionData {
  hash: string;
  fromAccountId: string;
  toAccountId: string;
  currency: string;
  amount: number;
  description: string;
  createdDateMs: number;
  acknowledgedDateMs: number;
  externalRef: string;
}

export const AccountTransactionDataSchema = new Schema(
  {
    hash: { type: String, required: false },
    fromAccountId: { type: String, required: false },
    toAccountId: { type: String, required: false },
    currency: { type: String, required: false },
    amount: { type: Number, required: false },
    description: { type: String, required: false },
    createdDateMs: { type: Number, required: false },
    acknowledgedDateMs: { type: Number, required: false },
    externalRef: { type: String, required: false },
  },
  { timestamps: false },
);

export type RenewTokenResponse = GenericResponse<RenewTokenData>;
export type AccountTransactionResponse = GenericResponse<null | AccountTransactionData>;
