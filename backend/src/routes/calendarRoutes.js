import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addcalendarEntry, getCalendarEntries, deleteCalendarEntry } from '../controllers/calendarController.js';

const router = express.Router();

//adding a calendar entry (medication - appointment)
router.post('/add', authMiddleware(['Client', 'Caregiver']), addcalendarEntry);

//get all entries for a request's shared calendar
router.get('/:requestId', authMiddleware(['Client', 'Caregiver']), getCalendarEntries);

//delete an entry
router.delete('/entry/:entryId', authMiddleware(['Client', 'Caregiver']), deleteCalendarEntry);

export default router;