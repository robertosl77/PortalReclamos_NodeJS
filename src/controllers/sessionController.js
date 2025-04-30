import { sessionStore } from "../app.js"

/**
 * Lista todas las sesiones activas, excluyendo las sesiones de prueba
 */
export function listarSesionesActivas(req, res) {
  try {
    sessionStore.all((err, sesiones) => {
      if (err) {
        console.error("❌ Error al acceder a las sesiones:", err.message)
        return res.status(500).json({
          error: "Error al recuperar las sesiones activas",
          message: err.message,
        })
      }

      // Filtrar solo sesiones de usuarios reales (no de prueba)
      const sesionesReales = {}
      let contadorSesionesReales = 0

      Object.keys(sesiones || {}).forEach((sessionId) => {
        const sesion = sesiones[sessionId]

        // Verificar si es una sesión de usuario real
        // Criterios: tiene usuario y el username no contiene "prueba" o "test"
        if (
          sesion.usuario &&
          sesion.usuario.username &&
          !sesion.usuario.username.toLowerCase().includes("prueba") &&
          !sesion.usuario.username.toLowerCase().includes("test")
        ) {
          // Es una sesión real
          contadorSesionesReales++

          // Calcular tiempo restante de la sesión
          const tiempoRestante =
            sesion.cookie && sesion.cookie.expires ? new Date(sesion.cookie.expires) - new Date() : 0

          // Formatear la información de la sesión
          sesionesReales[sessionId] = {
            usuario: {
              username: sesion.usuario.username,
              roles: sesion.usuario.roles || [],
              // Información adicional del LDAP
              nombre: sesion.usuario.info?.fullName || "Sin nombre",
              email: sesion.usuario.info?.email || sesion.usuario.username+"@edenor.com",
              telefono: sesion.usuario.info?.phone || "Sin teléfono",
              // Incluir más campos si es necesario
            },
            actividad: {
              loginTime: sesion.usuario.loginTime || "Desconocido",
              ultimaActividad: sesion.lastAccess || "Desconocido",
              ip: sesion.usuario.ip || "Desconocida",
              userAgent: sesion.usuario.userAgent || "Desconocido",
            },
            expiracion: {
              fecha: sesion.cookie?.expires ? new Date(sesion.cookie.expires).toISOString() : "Desconocido",
              tiempoRestanteMs: tiempoRestante,
              tiempoRestanteMin: Math.round(tiempoRestante / 60000),
            },
          }

          // Si hay foto, incluir la URL o indicar que está disponible
          if (sesion.usuario.info?.photo) {
            sesionesReales[sessionId].usuario.tieneFoto = true
            // No incluimos la foto directamente porque puede ser muy grande
          }
        }
      })

      // Devolver las sesiones reales
      res.json({
        timestamp: new Date().toISOString(),
        total: contadorSesionesReales,
        sesiones: sesionesReales,
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

/**
 * Endpoint para obtener la foto de perfil de un usuario
 */
export function obtenerFotoPerfil(req, res) {
  const { sessionId } = req.params

  if (!sessionId) {
    return res.status(400).json({ error: "Se requiere ID de sesión" })
  }

  sessionStore.get(sessionId, (err, sesion) => {
    if (err) {
      console.error(`❌ Error al obtener la sesión ${sessionId}:`, err.message)
      return res.status(500).json({
        error: "Error al obtener la sesión",
        message: err.message,
      })
    }

    if (!sesion || !sesion.usuario || !sesion.usuario.info || !sesion.usuario.info.photo) {
      return res.status(404).json({ error: "Foto de perfil no encontrada" })
    }

    // Enviar la foto como respuesta
    res.writeHead(200, {
      "Content-Type": "image/jpeg", // Ajustar según el formato real
      "Content-Length": sesion.usuario.info.photo.length,
    })
    res.end(sesion.usuario.info.photo)
  })
}

/**
 * Actualiza la marca de tiempo de última actividad para la sesión actual
 */
export function actualizarUltimaActividad(req, res, next) {
  if (req.session) {
    req.session.lastAccess = new Date().toISOString()
  }
  next()
}

/**
 * Cierra una sesión específica por su ID
 */
export function cerrarSesion(req, res) {
  const { sessionId } = req.params

  if (!sessionId) {
    return res.status(400).json({ error: "Se requiere ID de sesión" })
  }

  sessionStore.destroy(sessionId, (err) => {
    if (err) {
      console.error(`❌ Error al cerrar la sesión ${sessionId}:`, err.message)
      return res.status(500).json({
        error: "Error al cerrar la sesión",
        message: err.message,
      })
    }

    console.log(`✅ Sesión ${sessionId} cerrada correctamente`)
    res.json({ success: true, message: `Sesión ${sessionId} cerrada correctamente` })
  })
}

/**
 * Cierra todas las sesiones excepto la actual
 */
export function cerrarTodasLasSesiones(req, res) {
  const sesionActualId = req.sessionID

  sessionStore.all((err, sesiones) => {
    if (err) {
      console.error("❌ Error al acceder a las sesiones:", err.message)
      return res.status(500).json({
        error: "Error al recuperar las sesiones",
        message: err.message,
      })
    }

    const promesas = Object.keys(sesiones || {})
      .filter((id) => id !== sesionActualId) // Excluir la sesión actual
      .map((id) => {
        return new Promise((resolve, reject) => {
          sessionStore.destroy(id, (err) => {
            if (err) {
              console.error(`❌ Error al cerrar la sesión ${id}:`, err.message)
              reject(err)
            } else {
              console.log(`✅ Sesión ${id} cerrada correctamente`)
              resolve(id)
            }
          })
        })
      })

    Promise.allSettled(promesas)
      .then((resultados) => {
        const exitosos = resultados.filter((r) => r.status === "fulfilled").length
        const fallidos = resultados.filter((r) => r.status === "rejected").length

        res.json({
          success: true,
          message: `${exitosos} sesiones cerradas correctamente, ${fallidos} fallidas`,
          sesionActual: sesionActualId,
          sesionesEliminadas: exitosos,
          sesionesFallidas: fallidos,
        })
      })
      .catch((error) => {
        console.error("❌ Error al cerrar sesiones:", error)
        res.status(500).json({
          error: "Error al cerrar sesiones",
          message: error.message,
        })
      })
  })
}
