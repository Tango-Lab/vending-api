import mongoose, { Document, Schema } from 'mongoose';

import { Currency } from '../enums/Currency';
import { PaymentMethod } from '../enums/Order';
import { TransactionStatus, TransactionType } from '../enums/Transaction';
import { AccountTransactionData, AccountTransactionDataSchema } from './SitAPI';

// Define the ITransaction interface extending Document
export interface ITransaction extends Document {
  order: mongoose.Types.ObjectId;
  paymentMethod: PaymentMethod;
  transactionType: TransactionType;
  currency: Currency;
  amount: number;
  status: TransactionStatus;
  paymentTimestamp: Date;
  paymentProvider: string;
  ip: string;
  transactionNo: string;
  note: string;
  hashBakongCode: string;
  paymentMetadata: string;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
  paymentInfo: AccountTransactionData;
}

// Reusable enum validator function
const enumValidator = (enumObject: object) => ({
  validator: function (value: any) {
    return !Array.isArray(value) && Object.values(enumObject).includes(value);
  },
  message: (props: any) => `${props.value} is not a valid value!`,
});

// Define the Transaction schema
const TransactionSchema: Schema<ITransaction> = new Schema<ITransaction>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  paymentMethod: {
    type: Number,
    required: true,
    validate: enumValidator(PaymentMethod),
  },
  transactionType: {
    type: Number,
    required: true,
    validate: enumValidator(TransactionType),
  },
  currency: {
    type: String,
    enum: Object.values(Currency),
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: Number,
    required: true,
    validate: enumValidator(TransactionStatus),
  },
  paymentProvider: { type: String, required: true },
  paymentInfo: {
    type: AccountTransactionDataSchema,
    required: false,
    default: {},
  },
  ip: { type: String, required: true },
  note: { type: String, required: false },
  transactionNo: { type: String, required: true, unique: true },
  hashBakongCode: { type: String, required: true },
  paymentMetadata: { type: String, required: true },
  paymentReference: { type: String, required: false },
  paymentTimestamp: { type: Date, required: false, default: null },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
});

// Create the Mongoose model
const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export { Transaction };
