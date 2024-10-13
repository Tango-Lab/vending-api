import mongoose, { Document, Schema } from 'mongoose';

export interface ISerialPrefix extends Document {
  tableName: string;
  prefix: string;
  serialCode: number;
  prefixCode: string; // Add this line
}

const SerialPrefixSchema: Schema<ISerialPrefix> = new Schema(
  {
    tableName: { type: String, required: true, unique: true }, // Store entity name or table name
    prefix: { type: String, required: true }, // Prefix for the code (e.g., 'T')
    serialCode: { type: Number, required: true, default: 1 }, // Incrementing counter
  },
  {
    toJSON: { virtuals: true }, // Enable virtual fields in toJSON
    toObject: { virtuals: true }, // Enable virtual fields in toObject
  },
);

// Virtual field to generate the formatted code (e.g., 'T-00001')
SerialPrefixSchema.virtual('prefixCode').get(function () {
  const serialCodeStr = this.serialCode.toString().padStart(5, '0'); // Minimum 5 digits, can grow beyond that
  return `${this.prefix}-${serialCodeStr}`;
});

// Pre-save middleware to auto-increment code based on tableName
SerialPrefixSchema.pre('save', async function (next) {
  const doc = this as ISerialPrefix;
  doc.serialCode = 1;
  next();
});

const SerialPrefix = mongoose.model<ISerialPrefix>('SerialPrefix', SerialPrefixSchema);
export { SerialPrefix };
