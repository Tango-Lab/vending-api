import { injectable } from 'inversify';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { State } from '../enums/State';
import { IMachine } from '../models';
import Machine from '../models/Machine';

export interface MachineService extends BaseService<IMachine> {
  findOneByIdWithPopulated: (id: string) => Promise<IMachine>;
  findOneActiveByIdAndSerialNo: (id: string, serialNo: string) => Promise<IMachine | null>;
}

@injectable()
export class MachineServiceImpl extends BaseServiceImpl<IMachine> {
  model = Machine;

  constructor() {
    super();
  }

  async findOneByIdWithPopulated(id: string) {
    const result = await this.model
      .findById(id)
      .populate({
        path: 'slots',
        options: { sort: { slotNo: 1 } },
        populate: { path: 'product' },
      })
      .exec();
    return result;
  }

  async findOneActiveByIdAndSerialNo(id: string, serialNo: string) {
    const machine = await this.model
      .findOne({
        $and: [{ _id: id, 'device.serialNo': serialNo, state: State.Active }],
      })
      .exec();
    return machine;
  }
}
