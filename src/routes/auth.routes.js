import { Router } from 'express';
import { loginHandler } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginHandler); // esta es tu POST /api/login

export default router;