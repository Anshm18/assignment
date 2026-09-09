import type { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ status: 'success', data: { product } });
  } catch (err) { next(err); }
};

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('Fetching products with filters:', req.query);
    const filter: any = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.inStock === 'true') filter.stockQuantity = { $gt: 0 };
    if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Product.countDocuments(filter);

    console.log(`Fetched ${products.length} products out of ${total} total products`);

    res.status(200).json({ status: 'success', results: products.length, total, page, data: { products } });
  } catch (err) { next(err); }
};

export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Fetching product with ID: ${req.params.id}`);
    const product = await Product.findById(req.params.id);
    if (!product){
       console.log('Product not found');
       return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    console.log('Product fetched successfully:', product);
    res.status(200).json({ status: 'success', data: { product } });
  } catch (err) { next(err); }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Updating product with ID: ${req.params.id}`);
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product){
       console.log('Product not found');
       return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    console.log('Product updated successfully:', product);
    res.status(200).json({ status: 'success', data: { product } });
  } catch (err) { next(err); }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(`Deleting product with ID: ${req.params.id}`);
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product){
       console.log('Product not found');
       return res.status(404).json({ status: 'fail', message: 'Product not found' });
    }
    console.log('Product deleted successfully');  
    res.status(204).json({ status: 'success', data: null });
  } catch (err) { next(err); }
};