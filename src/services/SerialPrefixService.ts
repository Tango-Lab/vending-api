import { injectable } from 'inversify';
import mongoose from 'mongoose';

import { BaseService, BaseServiceImpl } from '../base/BaseService';
import { ISerialPrefix, SerialPrefix } from '../models/SerialPrefix';

export interface SerialPrefixService extends BaseService<ISerialPrefix> {
  retrieveOrGenerateSerialPrefix: (
    tableName: string,
    prefix: string,
    session?: mongoose.ClientSession,
  ) => Promise<ISerialPrefix>;
}

@injectable()
export class SerialPrefixServiceImpl
  extends BaseServiceImpl<ISerialPrefix>
  implements SerialPrefixService
{
  model = SerialPrefix;

  constructor() {
    super();
  }

  async retrieveOrGenerateSerialPrefix(
    tableName: string,
    prefix: string,
    session?: mongoose.ClientSession,
  ): Promise<ISerialPrefix> {
    // Try to find an existing serial prefix
    let serialPrefix: ISerialPrefix | null = await SerialPrefix.findOne({
      tableName,
      prefix,
    });

    if (serialPrefix) {
      // Update the existing serial prefix
      serialPrefix = (await SerialPrefix.findOneAndUpdate(
        { tableName, prefix },
        { $set: { prefix, serialCode: serialPrefix.serialCode + 1 } }, // Update specific fields as needed
        { new: true, session }, // Include the session for the transaction
      ).exec()) as ISerialPrefix; // Cast to ISerialPrefix
    } else {
      // Create a new serial prefix entry
      serialPrefix = await new SerialPrefix({ tableName, prefix }).save({
        session,
      });
    }

    return serialPrefix;
  }
}
