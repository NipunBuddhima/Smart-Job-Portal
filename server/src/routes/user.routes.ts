import { Router } from 'express';
import { updateProfile, uploadCompanyLogo, uploadUserAvatar, uploadUserResume } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { uploadAvatar, uploadResume } from '../middleware/upload.middleware';

const router = Router();

router.use(protect); // All user routes require authentication

router.put('/profile', updateProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadUserAvatar);
router.post('/resume', uploadResume.single('resume'), uploadUserResume);
router.post('/company-logo', uploadAvatar.single('companyLogo'), uploadCompanyLogo);

export default router;