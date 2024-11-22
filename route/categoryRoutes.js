import express from 'express';
import { 
    getAllCategories, 
    getCategoryById, 
    createCategory, 
    updateCategory, 
    deleteCategory, 
    getCategoryByEventId,
    getCategoryByuuid,
    getCategoryByCategory_uuid
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.get('/nominee/:id', getCategoryByuuid);
router.get('/:id', getCategoryById);
router.get('/vote/:id', getCategoryByCategory_uuid);
router.get('/:id/eventid', getCategoryByEventId);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
