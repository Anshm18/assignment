import express from 'express';
import protect from '../middleware/auth';
import {getProducts, createProduct, getProduct, updateProduct,deleteProduct} from '../controller/productController';
const router = express.Router();

router.route('/').get(getProducts);
router.post('/',protect, createProduct);
router.route('/:id').get(getProduct)
router.patch('/:id',protect, updateProduct)
router.delete('/:id',protect, deleteProduct);

export default router;