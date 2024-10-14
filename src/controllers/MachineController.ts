import { Request } from 'express';
import { inject, injectable } from 'inversify';

import { Authorization, ContextRequest, Controller, GET, NotFoundError, POST, PUT } from '../../packages';
import { State } from '../enums/State';
import { IDeviceStatus, IMachine } from '../models';
import { MachineService } from '../services';
import { Pagination } from '../utils/Pagination';

@Controller('/machines')
@injectable()
export class MachineController {
  @inject('MachineService')
  machineSv!: MachineService;

  @GET('/v1/list')
  @Authorization
  async getAllMachine(@ContextRequest request: Request<any, any, IMachine>) {
    const { name, type } = request.query;
    const pagination = new Pagination(request).getParam();
    const filter = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    if (type) {
      Object.assign(filter, { type });
    }
    const user = await this.machineSv.getAllWithPagination(pagination, filter, { createdAt: -1 });
    return user;
  }

  @GET('/v1/autocomplete')
  async getAllAutoMachine(@ContextRequest request: Request<any, any, IMachine>) {
    const { name } = request.query;
    const filter = {};

    if (name) {
      Object.assign(filter, { name: { $regex: name, $options: 'i' } });
    }

    const lists = await this.machineSv.getAllAutoComplete(filter, ['id', 'name', 'imageUrl']);
    return lists;
  }

  @GET('/v1/:id')
  async fineOneById(@ContextRequest request: Request<any, any, IMachine>) {
    const { id } = request.params;
    let machine = await this.machineSv.findOneByIdWithPopulated(id);
    if (!machine) {
      throw new NotFoundError('This id does not existed');
    }
    return machine;
  }

  @GET('/v1/serial/:serialNo')
  async findOneBySerialNo(@ContextRequest request: Request<any, any, IMachine>) {
    const { serialNo } = request.params;
    let machine = await this.machineSv.findOne({ 'device.serialNo': serialNo });
    if (!machine) {
      throw new NotFoundError('This Serial does not existed');
    }
    return machine;
  }

  @PUT('/v1/sync/:id')
  async syncMachineByID(@ContextRequest request: Request<any, any, IDeviceStatus>) {
    const { id } = request.params;
    const body = request.body;
    let machine = await this.machineSv.findOneById(id);
    if (!machine) {
      throw new NotFoundError('This machine does not existed');
    }

    machine.device = {
      ...machine.device,
      ip: body.ip,
      modelNo: body.modelNo,
      serialNo: body.serialNo,
    };

    const user = await this.machineSv.findOneByIdAndUpdate(id, machine, {
      new: true,
      runValidators: true,
    });
    return user;
  }

  @PUT('/v1/:id')
  @Authorization
  async updateMachine(@ContextRequest request: Request<any, any, IMachine>) {
    const { id } = request.params;
    const user = await this.machineSv.findOneByIdAndUpdate(id, request.body, {
      new: true,
      runValidators: true,
    });
    return user;
  }

  @POST('/v1/create')
  @Authorization
  async createMachine(@ContextRequest request: Request<any, any, IMachine>) {
    let machine = request.body;
    machine.state = State.Active;

    if (request.userId) {
      machine.createdBy = request.userId;
    }

    const user = await this.machineSv.create(machine);
    return user;
  }

  @POST('/v1/create-batch')
  @Authorization
  async createMachineBatch(@ContextRequest request: Request<any, any, IMachine[]>) {
    let machines = [] as any;

    if (request.userId) {
      machines = request.body.map((machine: IMachine) => ({
        ...machine,
        createdBy: request.userId,
        state: State.Active,
      }));
    }

    const user = await this.machineSv.createBatch(machines);
    return user;
  }
}
