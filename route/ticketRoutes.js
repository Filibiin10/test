// routes/ticketingevents.js
import express from 'express';
import {
    getAllTickets,
} from '../controllers/ticketRecord.js';

const router = express.Router();

// Define routes for CRUD operations
router.get('/', getAllTickets);

export default router;
