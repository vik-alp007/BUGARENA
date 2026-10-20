import { Router } from 'express';
import { register, login, getMe, updateProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);

export default router;
