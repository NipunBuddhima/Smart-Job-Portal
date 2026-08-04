import { Router } from 'express';
import { 
  getCandidateDashboard, 
  getEmployerDashboard, 
  getAdminDashboard 
} from '../controllers/dashboard.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(protect);

router.get('/candidate', authorize('candidate'), getCandidateDashboard);
router.get('/employer', authorize('employer'), getEmployerDashboard);
router.get('/admin', authorize('admin'), getAdminDashboard);

export default router;