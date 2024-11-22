import express from 'express';
import { FundraiserController,getAllFundraisers,getFundraiserById } from '../controllers/FundraiserController.js';

const router = express.Router();

// Route to create a new fundraiser
router.post('/create', FundraiserController);
router.get('/', getAllFundraisers);
router.get('/:id', getFundraiserById);

export default router;


