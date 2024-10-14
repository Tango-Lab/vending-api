import mongoose, { Document, Model, Schema } from 'mongoose';



export interface IMachineSlot extends Document {
  slotNo: string;
  price: number;
  quantity: number;
  availableQuantity: number;
  lastRestock: Date;
  note: string;
  sensorData: string;
  capacity: number;
  sensorAddress: string;
  productExpirationDate: Date;
  //
  machine: mongoose.Types.ObjectId; // Optional field for referencing products
  product: mongoose.Types.ObjectId; // Optional field for referencing products
}

// Define the MachineSlot schema
const MachineSlotSchema: Schema<IMachineSlot> = new Schema(
  {
    slotNo: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Price should be a positive number
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Ensure the capacity is at least 1
    },
    availableQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Ensure the capacity is at least 1
    },
    capacity: {
      type: Number,
      required: true,
      min: 0, // Ensure the capacity is at least 1
    },
    lastRestock: {
      type: Date,
      required: false,
      default: null,
    },
    productExpirationDate: {
      type: Date,
      required: false,
      default: null,
    },
    sensorData: {
      type: String,
      required: false,
      default: null,
    },
    sensorAddress: {
      type: String,
      required: false,
      default: null,
    },
    note: {
      type: String,
      required: false,
      default: null,
    },
    machine: { type: Schema.Types.ObjectId, ref: 'Machine', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt fields
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

// Create the MachineSlot model
const MachineSlot: Model<IMachineSlot> = mongoose.model<IMachineSlot>('MachineSlot', MachineSlotSchema);

export default MachineSlot;
