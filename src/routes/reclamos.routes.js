import { Router } from 'express';
import { 
    buscarReclamos,
    obtenerReclamosActivos, 
    obtenerReclamosCerrados, 
    validaCuenta, 
    buscaCliente } from '../controllers/reclamosController.js';

const router = Router();

router.get('/buscarReclamos/:cuenta/:ahora', buscarReclamos);
router.get('/obtenerReclamosActivos/:cuenta', obtenerReclamosActivos);
router.get('/obtenerReclamosCerrados/:cuenta', obtenerReclamosCerrados);
router.get('/validaCuenta/:cuenta', validaCuenta);
router.get('/buscaCliente/:cuenta', buscaCliente);

export default router;
