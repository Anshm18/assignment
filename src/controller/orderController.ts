import type { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import type { AuthRequest } from '../types';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Creating order for user:', req.user!._id);
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log('Invalid order products');
      return res.status(400).json({ status: 'fail', message: 'Order must contain at least one product' });
    }

    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      // ATOMIC UPDATE: Prevents race conditions
      // This is the key to solving the concurrency problem
      const product = await Product.findOneAndUpdate(
        { _id: item.productId, stockQuantity: { $gte: item.quantity } },
        { $inc: { stockQuantity: -item.quantity } },
        { returnDocument: 'after' } 
      );

      if (!product) {
        console.log(`Insufficient stock or product not found for ID: ${item.productId}`);
        return res.status(400).json({ 
          status: 'fail', 
          message: `Insufficient stock or product not found for ID: ${item.productId}` 
        });
      }

      console.log(`Product ${product._id} stock updated. New stock: ${product.stockQuantity}`);

      totalAmount += product.price * item.quantity;
      orderProducts.push({ productId: product._id, quantity: item.quantity });
    }

    // Create the order (no transaction needed)
    const order = await Order.create({
      userId: req.user!._id,
      products: orderProducts,
      totalAmount
    });

    console.log('Order created successfully:', order);
    res.status(201).json({ status: 'success', data: { order } });
  } catch (err: any) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const getUserOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching orders for user:', req.user!._id);
    const orders = await Order.find({ userId: req.user!._id }).populate('products.productId');
    res.status(200).json({ status: 'success', results: orders.length, data: { orders } });
  } catch (err) { 
    next(err); 
  }
};

export const getOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching order with ID:', req.params.id);
    const order = await Order.findOne({ _id: req.params.id, userId: req.user!._id }).populate('products.productId');
    if (!order) {
      console.log('Order not found');
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }
    console.log('Order fetched successfully:', order);
    res.status(200).json({ status: 'success', data: { order } });
  } catch (err) { 
    next(err); 
  }
};