import express from 'express';
import { 
    getAllEventCategories
} from '../controllers/eventCategories.js';

const router = express.Router();

router.get('/', getAllEventCategories);

export default router;
