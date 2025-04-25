import { Router } from 'express';
import { obtenerReclamos } from '../controllers/reclamosController.js';

const router = Router();

router.get('/reclamos', obtenerReclamos);

export default router;
