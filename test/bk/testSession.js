import { sessionStore } from "../app.js"

export function listarSesiones(req, res) {
  console.log("🧪 Verificando sessionStore...")
  console.log("🧪 sessionStore existe:", typeof sessionStore !== "undefined")
  console.log("🧪 sessionStore tiene método all:", typeof sessionStore.all === "function")

  try {
    sessionStore.all((err, sesiones) => {
      if (err) {
        console.error("❌ Error al acceder a las sesiones:", err.message)
        return res.status(500).json({
          error: "Error al recuperar las sesiones activas",
          message: err.message,
        })
      }

      console.log("✅ Sesiones recuperadas correctamente")
      console.log("📊 Número de sesiones activas:", Object.keys(sesiones || {}).length)

      // Transformar las sesiones para mostrar información más legible
      const sesionesFormateadas = {}
      Object.keys(sesiones || {}).forEach((sessionId) => {
        const sesion = sesiones[sessionId]
        sesionesFormateadas[sessionId] = {
          usuario: sesion.usuario || "Anónimo",
          creada: sesion.cookie ? new Date(sesion.cookie.expires).toISOString() : "Desconocido",
          expira: sesion.cookie ? new Date(Date.now() + sesion.cookie.originalMaxAge).toISOString() : "Desconocido",
        }
      })

      res.json({
        total: Object.keys(sesiones || {}).length,
        sesiones: sesionesFormateadas,
      })
    })
  } catch (error) {
    console.error("❌ Error inesperado:", error)
    res.status(500).json({
      error: "Error interno del servidor",
      message: error.message,
    })
  }
}

