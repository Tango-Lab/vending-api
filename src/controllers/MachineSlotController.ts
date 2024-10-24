import { Request } from 'express';
import { inject, injectable } from 'inversify';

import {
  Authorization,
  BadRequestError,
  ContextRequest,
  Controller,
  DELETE,
  GET,
  MissingParamError,
  NotFoundError,
  POST,
  PUT,
} from '../../packages';
import { IMachineSlot } from '../models/MachineSlot';
import { MachineService, MachineSlotService, ProductService } from '../services';
import { Pagination } from '../utils/Pagination';

@Controller('/machine-slots')
@injectable()
export class MachineSlotController {
  @inject('MachineSlotService')
  machineSlotSv!: MachineSlotService;

  @inject('MachineService')
  machineSv!: MachineService;

  @inject('ProductService')
  productSv!: ProductService;

  @GET('/v1/machine/:machineId')
  async groupByMachineID(@ContextRequest request: Request<any, any, IMachineSlot>) {
    const { machineId } = request.params;
    if (!machineId) {
      return [];
    }
    const filter = { machine: machineId };
    const items = await this.machineSlotSv.getAllWithPopulated(filter, ['product']);
    return items;
  }

  @GET('/v1/list')
  async getAll() {
    const list = await this.machineSlotSv.getAllWithPopulated();
    return list;
  }

  @GET('/v1/admin/list')
  @Authorization
  async getAllForAdmin(@ContextRequest request: Request<any, any, IMachineSlot>) {
    const pagination = new Pagination(request).getParam();
    const list = await this.machineSlotSv.getAllWithPagination(pagination, {}, {}, ['machine', 'product']);
    return list;
  }

  @POST('/v1/create')
  @Authorization
  async createMachine(@ContextRequest request: Request<any, any, IMachineSlot>) {
    let data = request.body;

    if (!data.slotNo) {
      throw new MissingParamError('slotNo');
    }

    if (data.quantity <= 0) {
      throw new BadRequestError('quantity cant be less than zero');
    }

    let slot = await this.machineSlotSv.findOne({ slotNo: data.slotNo, machine: data.machine });
    if (slot) {
      slot.lastRestock = new Date();
      slot.availableQuantity += data.quantity;
      slot.quantity = slot.availableQuantity;
      const response = await this.machineSlotSv.findOneByIdAndUpdate(slot.id, slot);
      return response;
    }

    data.availableQuantity = data.quantity;
    const machineProduct = await this.machineSlotSv.create(data);
    return machineProduct;
  }

  @POST('/v1/create-batch')
  async createMachineBatch(@ContextRequest request: Request<any, any, IMachineSlot[]>) {
    const data = request.body;
    const machineProduct = await this.machineSlotSv.createBatch(data);
    return machineProduct;
  }

  @PUT('/v1/:id')
  async updateMerchantSlot(@ContextRequest request: Request<any, any, IMachineSlot>) {
    const { id } = request.params;
    const body = request.body;

    let slot = await this.machineSlotSv.findOneById(id);
    if (!slot) {
      throw new NotFoundError('Merchant slot does not existed');
    }

    const product = await this.productSv.findOneById(body.product as any);
    if (!product) {
      throw new NotFoundError('This product does not existed');
    }

    slot.product = product.id;
    slot.quantity = body.quantity;
    slot.capacity = body.capacity;
    slot.lastRestock = body.lastRestock;
    slot.productExpirationDate = body.productExpirationDate;
    slot.sensorData = body.sensorData;
    slot.availableQuantity = body.availableQuantity;
    slot.slotNo = body.slotNo;
    slot.price = body.price;
    slot.isActive = body.isActive;
    slot.note = body.note;
    slot = await this.machineSlotSv.findOneByIdAndUpdate(id, slot, { new: true });
    return slot;
  }

  @DELETE('/v1/:id')
  async deleteItemById(@ContextRequest request: Request<any, any, IMachineSlot>) {
    const { id } = request.params;
    await this.machineSlotSv.deleteOneById(id);
  }
}
