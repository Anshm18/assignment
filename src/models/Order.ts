import { Schema, model, Document, Types } from 'mongoose';

interface IOrderProduct {
  productId: Types.ObjectId;
  quantity: number;
}

export interface IOrder extends Document {
  userId: Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default model<IOrder>('Order', orderSchema);