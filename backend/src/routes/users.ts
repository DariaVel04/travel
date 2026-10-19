import { Router } from 'express';
import { changePassword, getProfile, updateProfile } from '../controllers/userController.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const usersRouter = Router();

usersRouter.get('/me', requireAuth, asyncHandler(getProfile));
usersRouter.put('/me', requireAuth, asyncHandler(updateProfile));
usersRouter.put('/me/password', requireAuth, asyncHandler(changePassword));
