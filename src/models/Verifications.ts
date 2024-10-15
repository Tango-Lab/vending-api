import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVerifications extends Document {
  verificationCode: string;
  createdAt: Date;
  expiresAt: Date;
  recipient: string;
  type: number;
}

const VerificationSchema: Schema<IVerifications> = new Schema<IVerifications>(
  {
    recipient: {
      type: String,
      required: true,
    },
    type: {
      type: Number,
      required: true,
    },
    verificationCode: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    expiresAt: {
      type: Date,
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

const Verification: Model<IVerifications> = mongoose.model<IVerifications>('Verifications', VerificationSchema);
export default Verification;
