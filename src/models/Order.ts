import mongoose, { Document, Schema } from 'mongoose';

import { Currency } from '../enums/Currency';
import { OrderStatus, PaymentStatus } from '../enums/Order';

export interface IOrder extends Document {
  ip: string;
  machine: mongoose.Types.ObjectId; // Optional field for referencing products
  totalAmount: number;
  serialNo: string;
  currency: Currency;
  orderNo: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  note: string | null;
  items: IOrderItem[];
  //
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: mongoose.Types.ObjectId; // Optional field for referencing products
  quantity: number;
  slotNo: string;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
}

// Order item schema
const OrderItemSchema: Schema<IOrderItem> = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  slotNo: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be at least 1'], // Ensures quantity is greater than or equal to 1 },
  },
  unitPrice: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be at least 1'], // Ensures quantity is greater than or equal to 1 },
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be at least 1'],
  },
});

// Define the Order schema
const OrderSchema: Schema = new Schema({
  machine: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: true,
  },
  serialNo: {
    type: String,
    required: true,
  },
  orderNo: {
    type: String,
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Quantity must be at least 1'],
  },
  currency: {
    type: String,
    default: Currency.KHR,
    required: true,
    validate: {
      validator: function (value: any) {
        return !Array.isArray(value) && Object.values(Currency).includes(value);
      },
      message: (props: any) => `${props.value} is not a valid currency!`,
    },
  },
  orderStatus: {
    type: Number,
    default: OrderStatus.Pending,
    required: true,
    validate: {
      validator: function (value: any) {
        return !Array.isArray(value) && Object.values(OrderStatus).includes(value);
      },
      message: (props: any) => `${props.value} is not a valid order status!`,
    },
  },
  paymentStatus: {
    type: Number,
    default: OrderStatus.Pending,
    required: true,
    validate: {
      validator: function (value: any) {
        return !Array.isArray(value) && Object.values(PaymentStatus).includes(value);
      },
      message: (props: any) => `${props.value} is not a valid order status!`,
    },
  },
  note: {
    type: String,
    required: false,
  },
  items: [OrderItemSchema], // Embedded array of order items
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updateAt: {
    type: Date,
    required: false,
    default: null,
  },
});

OrderSchema.virtual('payments', {
  ref: 'Transaction',
  localField: '_id',
  foreignField: 'order',
});

// Ensure virtual fields are included when converting to JSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

// Create the Mongoose model
const Order = mongoose.model<IOrder>('Order', OrderSchema);
export { Order };
