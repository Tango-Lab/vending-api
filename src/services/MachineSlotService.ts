import { injectable } from 'inversify';
import { ClientSession, FilterQuery } from 'mongoose';

import { BadRequestError } from '../../packages';
import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { IOrderItem } from '../models';
import MachineSlot, { IMachineSlot } from '../models/MachineSlot';

export interface MachineSlotService extends BaseService<IMachineSlot> {
  getAllWithPopulated: (query?: FilterQuery<IMachineSlot>, populated?: string | string[]) => Promise<IMachineSlot[]>;
  getTotalAvailableQuantity: (slotNo: string, machine: string) => Promise<number>;
  updateAvailableQuantity: (machine: string, orderItems: IOrderItem[], session?: ClientSession) => Promise<void>;
}

@injectable()
export class MachineSlotServiceImpl extends BaseServiceImpl<IMachineSlot> {
  model = MachineSlot;

  constructor() {
    super();
  }

  async getTotalAvailableQuantity(slotNo: string, machine: string): Promise<number> {
    const total = await MachineSlot.aggregate([
      { $match: { slotNo, machine } }, // Filter by slotNo
      {
        $group: {
          _id: null, // No specific grouping
          totalAvailableQuantity: { $sum: "$availableQuantity" } // Sum available quantities
        }
      }
    ]);

    return total.length > 0 ? total[0].totalAvailableQuantity : 0;
  }

  async updateAvailableQuantity(machine: string, orderItems: IOrderItem[], session?: ClientSession) {
    for (const item of orderItems) {
      // Find the corresponding machine slot
      let machineSlot = await MachineSlot.findOne({
        machine,
        slotNo: item.slotNo,
        product: item.product,
        availableQuantity: { $ne: 0 },
      });

      if (machineSlot) {
        // Update the availableQuantity by subtracting the ordered quantity
        machineSlot.availableQuantity -= item.quantity;

        // Ensure availableQuantity is not less than 0
        if (machineSlot.availableQuantity < 0) {
          throw new BadRequestError(`Insufficient stock in slot ${item.slotNo}`);
        }

        // Save the updated machine slot
        await machineSlot.save({ session });
      }
    }
  }

  async getAllWithPopulated(query?: FilterQuery<IMachineSlot>, populated = ['machine', 'product']) {
    const data = await this.model
      .find({ ...query })
      .sort({ slotNo: 1 })
      .populate(populated);
    return data;
  }
}
