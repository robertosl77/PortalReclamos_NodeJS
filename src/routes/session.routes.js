import { Router } from "express"
import {
  listarSesionesActivas,
  cerrarSesion,
  cerrarTodasLasSesiones,
  actualizarUltimaActividad,
  obtenerFotoPerfil,
} from "../controllers/sessionController.js"

const router = Router()

// Middleware para actualizar la marca de tiempo de última actividad
router.use(actualizarUltimaActividad)

// Rutas para gestión de sesiones
router.get("/sesiones", listarSesionesActivas)
router.get("/sesiones/:sessionId/foto", obtenerFotoPerfil)
router.delete("/sesiones/:sessionId", cerrarSesion)
router.delete("/sesiones", cerrarTodasLasSesiones)

export default router
