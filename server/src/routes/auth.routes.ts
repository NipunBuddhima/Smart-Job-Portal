import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// Protected route example
router.get('/me', protect, getMe);

// Role-based route example (Admin only)
router.get('/admin-stats', protect, authorize('admin'), (req, res) => {
  res.json({ success: true, data: 'Admin data accessed' });
});

export default router;