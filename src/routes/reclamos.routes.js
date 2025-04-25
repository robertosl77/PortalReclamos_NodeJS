import { Router } from 'express';
import { 
    obtenerReclamosActivos, 
    obtenerReclamosCerrados, 
    validaCuenta, 
    datosCliente } from '../controllers/reclamosController.js';

const router = Router();

router.get('/reclamos_activos/:cuenta', obtenerReclamosActivos);
router.get('/reclamos_cerrados/:cuenta', obtenerReclamosCerrados);
router.get('/valida_cuenta/:cuenta', validaCuenta);
router.get('/datos_cliente/:cuenta', datosCliente);

export default router;
