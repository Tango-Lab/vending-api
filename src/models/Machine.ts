import mongoose, { Document, Model, Schema } from 'mongoose';

import { IBaseModel } from '../base/BaseModel';
import { ConnectivityStatus, PowerStatus } from '../enums/Device';
import { IMachineSlot } from './MachineSlot';

export type TypeConnectivityStatus = 'online' | 'offline' | 'reconnecting' | 'unknown';

export type TypePowerStatus = 'on' | 'off' | 'standby' | 'unknown';

export interface IMachine extends Document, IBaseModel {
  name: string;
  installationDate: Date;
  note: string;
  capacity: number;
  lastRestocked: Date;
  contactPerson: string;
  location: ILocation;
  device: IDeviceStatus;
  //
  slots: IMachineSlot[];
}

// Define an interface for the vending machine
interface ILocation extends Document {
  name: string;
  latitude: number;
  longitude: number;
}

export interface IDeviceStatus {
  ip: string;
  modelNo: string;
  serialNo: string;
  connectivityStatus: ConnectivityStatus;
  powerStatus: PowerStatus;
  temperatureSensor: string;
}

const DeviceSchema = new Schema<IDeviceStatus>({
  ip: {
    type: String,
    required: false,
    default: null,
  },
  modelNo: {
    type: String,
    required: false,
    default: null,
  },
  serialNo: {
    type: String,
    required: false,
    default: null,
  },
  connectivityStatus: {
    type: String,
    enum: Object.values(ConnectivityStatus),
    required: true,
    default: ConnectivityStatus.UNKNOWN,
  },
  powerStatus: {
    type: String,
    enum: Object.values(PowerStatus),
    required: true,
    default: PowerStatus.UNKNOWN,
  },
  temperatureSensor: {
    type: String,
    required: false,
    default: null,
  },
});

// Define the Location schema
const LocationSchema: Schema<ILocation> = new Schema({
  name: {
    type: String,
    required: true, // Name is required
  },
  latitude: {
    type: Number,
    required: false,
  },
  longitude: {
    type: Number,
    required: false,
    default: null,
  },
});

const MachineSchema: Schema<IMachine> = new Schema<IMachine>(
  {
    name: {
      type: String,
      required: true,
    },
    installationDate: {
      type: Date,
      required: false,
      default: null,
    },
    note: {
      type: String,
      required: false,
      default: null,
    },
    capacity: {
      type: Number,
      required: false,
      min: 0,
      default: null,
    },
    lastRestocked: {
      type: Date,
      default: null,
      required: false, // Ensure that the lastRestocked field is required
    },
    contactPerson: {
      type: String,
      required: true, // Ensure that the contactPerson field is required
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    device: {
      type: DeviceSchema,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId, // Ensure type is consistent
      ref: 'User', // Reference to the User model
      required: false,
      default: null,
    },
    state: {
      type: Number, // Ensure type is consistent
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        // Transform the _id field to id
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

// Define a virtual field to populate products
MachineSchema.virtual('slots', {
  ref: 'MachineSlot',
  localField: '_id',
  foreignField: 'machine',
});

// Ensure virtual fields are included when converting to JSON
MachineSchema.set('toJSON', { virtuals: true });
MachineSchema.set('toObject', { virtuals: true });

const Machine: Model<IMachine> = mongoose.model<IMachine>('Machine', MachineSchema);
export default Machine;
