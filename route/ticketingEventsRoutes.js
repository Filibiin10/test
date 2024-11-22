// routes/ticketingevents.js
import express from 'express';
import {
  getAllEvents,
  fetchTicketingEvents,
  fetchTicketingEvent,
  fetchTicketingEventsById,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchTicketingEventsByUuid
} from '../controllers/ticketingeventsController.js';

const router = express.Router();

// Define routes for CRUD operations
router.get('/', getAllEvents);
router.get('/eventtype', fetchTicketingEvents);
router.get('/typeevnt', fetchTicketingEvent);
router.get('/event/:id', fetchTicketingEventsById);
router.get('/events/:uuid', fetchTicketingEventsByUuid);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
