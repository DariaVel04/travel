import { Router } from 'express';
import {
  createTrip,
  getTrip,
  listMyTrips,
  removeTrip,
  updateTrip,
} from '../controllers/tripController.js';
import { createOption, listOptions } from '../controllers/tripOptionController.js';
import { getItinerary, saveItinerary } from '../controllers/itineraryController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const tripsRouter = Router();

tripsRouter.use(requireAuth);

tripsRouter.get('/', asyncHandler(listMyTrips));
tripsRouter.get('/me', asyncHandler(listMyTrips));
tripsRouter.post('/', asyncHandler(createTrip));
tripsRouter.get('/:id', asyncHandler(getTrip));
tripsRouter.put('/:id', asyncHandler(updateTrip));
tripsRouter.delete('/:id', asyncHandler(removeTrip));

tripsRouter.get('/:tripId/options', asyncHandler(listOptions));
tripsRouter.post('/:tripId/options', asyncHandler(createOption));

tripsRouter.get('/:tripId/itinerary', asyncHandler(getItinerary));
tripsRouter.post('/:tripId/itinerary', asyncHandler(saveItinerary));
