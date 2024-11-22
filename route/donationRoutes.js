import express from 'express';
import {
    getAllDonations,
    getDonationById,
    getTotalDonations,
    createDonation,
    updateDonation,
    deleteDonation,
    getTodaysDonations,
    getWeeklyDonations,
} from '../controllers/donationController.js';

const router = express.Router();

// Route to get all donations
router.get('/', getAllDonations);

// Route to get a specific donation by ID
router.get('/:id', getDonationById);

// Route to get the total amount donated
router.get('/total', getTotalDonations);

// Route to get today's donations
router.get('/today', getTodaysDonations);

// Route to get weekly donations
router.get('/week', getWeeklyDonations);

// Route to create a new donation
router.post('/', createDonation);

// Route to update a donation by ID
router.put('/:id', updateDonation);

// Route to delete a donation by ID
router.delete('/:id', deleteDonation);

export default router;
