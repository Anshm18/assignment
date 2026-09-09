import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  category: string;
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: [true, 'Product name is required'], trim: true },
  description: { type: String, trim: true },
  price: { type: Number, required: [true, 'Price is required'], min: 0 },
  stockQuantity: { type: Number, required: [true, 'Stock quantity is required'], min: 0 },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', description: 'text' });

export default model<IProduct>('Product', productSchema);