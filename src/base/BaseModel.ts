import mongoose, { Document, PopulatedDoc, Schema } from 'mongoose';

import { State } from '../enums/State';

// Define an interface for the base schema with common fields
interface IBaseModel extends Document {
  state?: State;
  createdBy?: mongoose.Types.ObjectId;
}

// Define the base schema
const BaseSchema: Schema<IBaseModel> = new Schema<IBaseModel>({
  state: {
    type: Number,
    enum: Object.values(State), // Ensure state is one of the values in StateEnum
    default: State.Active,
  },
  createdBy: {
    type: Schema.Types.ObjectId, // Ensure type is consistent
    ref: 'User', // Reference to the User model
    required: false,
    default: null,
  },
});

export { IBaseModel, BaseSchema };
