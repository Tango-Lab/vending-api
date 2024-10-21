import { Request } from 'express';
import { inject, injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import { Authorization, ContextRequest, Controller, GET, Middleware, NotFoundError, POST } from '../../packages';
import { Currency } from '../enums/Currency';
import { ErrorCode } from '../enums/ErrorCode';
import { OrderStatus } from '../enums/Order';
import { ExpressHelper, OrderRequestParams } from '../helpers';
import { ensureVendingMachineIsAvailable, validateCancelOrderParam, validateOrderParam } from '../middlewares/VendingMachine';
import { IOrder } from '../models';
import { MachineService, MachineSlotService, OrderService } from '../services';
import { Pagination } from '../utils/Pagination';

@Controller('/orders')
@injectable()
export class OrderController {
  @inject('OrderService')
  orderSv!: OrderService;

  @inject('MachineSlotService')
  machineSlotSv!: MachineSlotService;

  @inject('MachineService')
  machineSv!: MachineService;

  @GET('/v1/admin/list')
  @Authorization
  async getAllOrderWithPagination(@ContextRequest request: Request<any, any, OrderRequestParams>) {
    const pagination = new Pagination(request).getParam();
    const { machine, status } = request.query;
    const filterQuery: FilterQuery<IOrder> = {};

    if (machine) {
      Object.assign(filterQuery, { machine });
    }

    if (status) {
      Object.assign(filterQuery, { orderStatus: status });
    }

    const data = await this.orderSv.getAllOrdersWithPagination(pagination, filterQuery);
    return data;
  }

  @GET('/v1/admin/:id')
  @Authorization
  async findOneById(@ContextRequest request: Request<any, any, OrderRequestParams>) {
    const { id } = request.params;
    const data = await this.orderSv.findOrderOneById(id);
    return data;
  }

  @POST('/v1/create')
  @Middleware([validateOrderParam, ensureVendingMachineIsAvailable])
  async createOrder(@ContextRequest req: Request<any, any, OrderRequestParams>) {
    const param = req.body;

    const machine = await this.machineSv.findOneActiveByIdAndSerialNo(param.machine, param.serialNo);
    if (!machine) {
      throw new NotFoundError('This vending machine does not existed.', ErrorCode.VendingMachineDoesNoExisted);
    }

    const machineSlots = await this.machineSlotSv.getAll({ machine: machine.id });
    if (!machineSlots.length) {
      throw new NotFoundError('This vending machine does not existed.', ErrorCode.VendingMachineDoesNoExisted);
    }

    const products = this.orderSv.sumQuantitiesBySlotNo(param);
    const itemOrders = this.orderSv.calculateProductTotalInSlots(machineSlots, products);

    const ip = ExpressHelper.getClientIp(req);
    const order = await this.orderSv.createOrder(param, ip, itemOrders);

    const response = {
      id: order.id,
      machine: order.machine,
      amount: order.totalAmount,
      orderNo: order.orderNo,
      currency: Currency.KHR,
    };
    return response;
  }

  @POST('/v1/cancel')
  @Middleware([validateCancelOrderParam])
  async cancelVendingMachineOrder(@ContextRequest req: Request<any, any, OrderRequestParams>) {
    const { machine, serialNo, orderNo } = req.body;
    const conditions = {
      machine,
      serialNo,
      orderNo,
      orderStatus: OrderStatus.Pending,
    };

    let order = await this.orderSv.findOne(conditions);
    if (!order) {
      throw new NotFoundError('This machine is currently available for order');
    }

    order.orderStatus = OrderStatus.Cancelled;
    await this.orderSv.findOneByIdAndUpdate(order.id, order);
  }
}
