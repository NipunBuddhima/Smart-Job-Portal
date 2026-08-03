import { Router } from 'express';
import { 
  applyForJob, 
  getCandidateApplications, 
  withdrawApplication, 
  getJobApplicants, 
  updateApplicationStatus 
} from '../controllers/application.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { uploadResume } from '../middleware/upload.middleware';

const router = Router();

router.use(protect);

// Candidate Routes
router.post('/apply/:jobId', authorize('candidate'), uploadResume.single('resume'), applyForJob);
router.get('/my-applications', authorize('candidate'), getCandidateApplications);
router.delete('/:id/withdraw', authorize('candidate'), withdrawApplication);

// Employer Routes
router.get('/job/:jobId', authorize('employer', 'admin'), getJobApplicants);
router.patch('/:id/status', authorize('employer', 'admin'), updateApplicationStatus);

export default router;