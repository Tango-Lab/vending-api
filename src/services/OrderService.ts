import { inject, injectable } from 'inversify';
import { ClientSession, FilterQuery } from 'mongoose';

import { BadRequestError, NotFoundError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { TransactionManager } from '../base/TransactionManager';
import { Currency } from '../enums/Currency';
import { OrderStatus, PaymentStatus } from '../enums/Order';
import { OrderProductsRequestParam, OrderRequestParams } from '../helpers/';
import { IMachineSlot, IOrder, IOrderItem, Order } from '../models';
import { IPagination, IResponseList, Paginator } from '../utils/Paginator';
import { SerialPrefixService } from './SerialPrefixService';

export interface OrderService extends BaseService<IOrder> {
  sumQuantitiesById: (param: OrderRequestParams) => OrderProductsRequestParam[];
  createOrder: (param: OrderRequestParams, ip: string, items: IOrderItem[]) => Promise<IOrder>;
  calculateProductTotalInSlots: (machinesSlot: IMachineSlot[], param: OrderProductsRequestParam[]) => IOrderItem[];
  signOrderCompleted: (id: string, session?: ClientSession) => Promise<void>;
  getAllOrdersWithPagination: (pagination: IPagination, filter?: FilterQuery<IOrder>) => Promise<IResponseList<IOrder>>;
  findOrderOneById: (id: string) => Promise<IOrder>;
}

@injectable()
export class OrderServiceImpl extends BaseServiceImpl<IOrder> implements OrderService {
  model = Order;

  @inject('SerialPrefixService')
  prefixSv!: SerialPrefixService;

  constructor() {
    super();
  }

  async findOrderOneById(id: string): Promise<IOrder> {
    const item = await Order.findById(id)
      .populate('machine')
      .populate({
        path: 'items.product', // Populate the product field in each item
        select: ['name', 'imageUrl', 'type'], // Optional: Select specific fields from the Product model
      })
      .populate({
        path: 'payments',
        select: ['paymentMethod', 'transactionNo', 'status', 'paymentTimestamp', 'paymentInfo'],
        options: { sort: { createdAt: -1 } },
      });

    if (!item) {
      throw new NotFoundError('This Order does not existed');
    }

    return item;
  }

  async getAllOrdersWithPagination(
    pagination: IPagination,
    filter?: FilterQuery<IOrder>,
  ): Promise<IResponseList<IOrder>> {
    const { limit, offset } = pagination;

    const data = await Order.find({ ...filter })
      .sort({ createdAt: -1 })
      .populate('machine')
      .populate({
        path: 'payments',
        select: ['paymentMethod', 'transactionNo', 'status', 'paymentTimestamp'],
        options: { sort: { createdAt: -1 }, limit: 1 },
      })
      .skip(offset)
      .limit(limit)
      .exec();

    const total = await this.model.countDocuments({ ...filter }).exec();
    const response = await new Paginator<IOrder>(data, total, offset, limit).paginate();
    return response;
  }

  async signOrderCompleted(id: string, session?: ClientSession) {
    const info: Partial<IOrder> = {
      orderStatus: OrderStatus.Completed,
      paymentStatus: PaymentStatus.Completed,
      updatedAt: new Date(),
    };
    await Order.findByIdAndUpdate(id, info, { session, new: true });
  }

  async createOrder(param: OrderRequestParams, ip: string, items: IOrderItem[]) {
    const totalAmount = parseFloat(this.#sumOrderTotalPrice(items).toFixed(2));
    const order = {
      machine: param.machine as any,
      serialNo: param.serialNo,
      totalAmount,
      ip,
      note: param.note ?? null,
      orderStatus: OrderStatus.Pending,
      paymentStatus: PaymentStatus.Pending,
      currency: Currency.KHR,
      createdAt: new Date(),
      items,
    };

    const response = await new TransactionManager().runs(async (session) => {
      const prefix = await this.prefixSv.retrieveOrGenerateSerialPrefix('Order', 'O', session);

      Object.assign(order, { orderNo: prefix.prefixCode });
      const result = await new Order(order).save({ session });
      return result;
    });

    return response;
  }

  sumQuantitiesById({ products }: OrderRequestParams) {
    const summedQuantities = products.reduce(
      (accumulator, product) => {
        // Create a unique key for the product id
        const key = product.id;

        // If the id already exists in the accumulator, add the quantity
        if (accumulator[key]) {
          accumulator[key].quantity += product.quantity;
        } else {
          // Otherwise, initialize the quantity for this id
          accumulator[key] = { ...product };
        }

        return accumulator;
      },
      {} as { [id: string]: OrderProductsRequestParam },
    );

    // Convert the accumulator object back into an array
    return Object.values(summedQuantities);
  }

  calculateProductTotalInSlots(machinesSlots: IMachineSlot[], products: OrderProductsRequestParam[]) {
    return products.map(({ id, slotNo, quantity: toBuyQuantity }): IOrderItem => {
      const machine = machinesSlots.find(
        ({ slotNo: machineSlotNo, product }) => product.toString() === id.toString() && machineSlotNo === slotNo,
      );

      if (!machine) {
        throw new NotFoundError(`Product '${id}' in slot '${slotNo}' is not available.`);
      }

      const { price: machinePrice, availableQuantity: machineQuantity, product } = machine;

      if (toBuyQuantity > machineQuantity) {
        throw new BadRequestError(`Requested quantity '${toBuyQuantity}' exceeds available stock for product '${id}'.`);
      }

      if (machinePrice === 0) {
        throw new BadRequestError(`Price is not set for product '${product}'.`);
      }

      // Return IOrderItem object for each product
      return {
        product: product,
        slotNo,
        unitPrice: machinePrice,
        quantity: toBuyQuantity,
        totalPrice: machinePrice * toBuyQuantity,
      };
    });
  }

  #sumOrderTotalPrice(orderItems: IOrderItem[]): number {
    return orderItems.reduce((total, item) => total + item.totalPrice, 0);
  }
}
