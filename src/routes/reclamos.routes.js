import { Router } from 'express';
import { obtenerReclamosActivos } from '../controllers/reclamosController.js';

const router = Router();

router.get('/reclamos/:cuenta', obtenerReclamosActivos);

export default router;
