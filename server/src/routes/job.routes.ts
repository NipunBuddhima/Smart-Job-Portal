import { Router } from 'express';
import {
	createJob,
	getJobs,
	getJobById,
	updateJob,
	deleteJob,
	closeJob,
	draftJob,
	saveJob,
	unsaveJob,
} from '../controllers/job.controller';
import { protect, authorize, attachOptionalUser } from '../middleware/auth.middleware';

const router = Router();

// Public / Candidate view
router.get('/', attachOptionalUser, getJobs);
router.get('/:id', attachOptionalUser, getJobById);

// Protected Employer views
router.post('/', protect, authorize('employer', 'admin'), createJob);
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);
router.patch('/:id/close', protect, authorize('employer', 'admin'), closeJob);
router.patch('/:id/draft', protect, authorize('employer', 'admin'), draftJob);
router.post('/:id/save', protect, authorize('candidate'), saveJob);
router.delete('/:id/save', protect, authorize('candidate'), unsaveJob);

export default router;