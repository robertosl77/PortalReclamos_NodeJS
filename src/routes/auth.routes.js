import { Router } from "express"
import { loginHandler } from "../controllers/authController.js"

const router = Router()

router.post("/login", loginHandler)

// Ruta de ping para verificar que el router funciona
router.get("/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date().toISOString() })
})

export default router
