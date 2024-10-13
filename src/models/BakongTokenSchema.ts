import { Document, model, Schema } from 'mongoose';

// Define the interface
export interface IBakongToken extends Document {
  token: string;
  type: string;
  createdAt: Date;
}

// Create the schema
const BakongTokenSchema = new Schema<IBakongToken>(
  {
    token: { type: String, required: true },
    type: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: { virtuals: true }, // Enable virtual fields in toJSON
    toObject: { virtuals: true }, // Enable virtual fields in toObject
  },
);

// Create a virtual property for `id`
BakongTokenSchema.virtual('id').get(function () {
  return this._id.toString();
});

// Enable toJSON to include virtuals in the output
BakongTokenSchema.set('toJSON', {
  virtuals: true,
});

// Create and export the model
export const BakongToken = model<IBakongToken>('BakongToken', BakongTokenSchema);
