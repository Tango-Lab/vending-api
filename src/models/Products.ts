import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  code: string;
  type: string;
  barCode: string;
  imageUrl: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
}

// Define the Product schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: false, default: null },
    code: { type: String, required: false, default: null },
    type: { type: String, required: false, default: null },
    barCode: { type: String, required: false, default: null },
    imageUrl: { type: String, required: false, default: null },
    price: { type: Number, required: false, default: null },
    isActive: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, default: Date.now },
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

// Create the Product model
const Product: Model<IProduct> = mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
