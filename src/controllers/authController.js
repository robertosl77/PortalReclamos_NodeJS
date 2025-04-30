import { authenticateUser } from "../servicios/ldapAuth.js"

export async function loginHandler(req, res) {
  const { floatingInput, floatingPassword } = req.body
  console.info(`Usuario: ${floatingInput}`)

  try {
    const result = await authenticateUser(floatingInput, floatingPassword)

    if (result.authenticated) {
      console.info(`✅ Login exitoso para ${floatingInput}`)
      console.info("Roles del usuario:", result.roles)

      // Verificar que tenemos la información del usuario
      if (result.info) {
        console.info("Información del usuario:", Object.keys(result.info))
      } else {
        console.warn("⚠️ No se recibió información adicional del usuario")
      }

      // Guardar toda la información en la sesión, incluyendo info
      req.session.usuario = {
        username: floatingInput,
        roles: result.roles,
        info: result.info, // Guardar la información adicional del LDAP
        loginTime: new Date().toISOString(),
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      }

      return res.redirect("/PortalReclamos/reclamos.html")
    }

    console.warn(`❌ Login fallido para ${floatingInput}`)
    res.status(401).send("Credenciales inválidas")
  } catch (err) {
    console.error("🛑 Error en login LDAP:", err.message)

    if (err.message.includes("conectar")) {
      return res.status(503).send("No se pudo conectar al servidor de autenticación.")
    }

    return res.status(500).send("Error interno en autenticación.")
  }
}
