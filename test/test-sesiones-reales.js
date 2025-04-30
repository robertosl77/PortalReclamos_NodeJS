// Script para probar la API de sesiones reales
import fetch from "node-fetch"

async function testSesionesReales() {
  try {
    console.log("🧪 Probando API de sesiones reales...")

    // 1. Listar sesiones activas (reales)
    console.log("1️⃣ Listando sesiones activas reales...")
    const listSessionsResponse = await fetch("http://localhost:8081/api/sesiones")
    const listSessionsData = await listSessionsResponse.json()
    console.log("✅ Sesiones activas reales:", JSON.stringify(listSessionsData, null, 2))

    // Si hay sesiones, probar cerrar una
    const sessionIds = Object.keys(listSessionsData.sesiones || {})
    if (sessionIds.length > 0) {
      const sessionIdToClose = sessionIds[0]
      console.log(`\n2️⃣ Cerrando la sesión ${sessionIdToClose}...`)

      const closeSessionResponse = await fetch(`http://localhost:8081/api/sesiones/${sessionIdToClose}`, {
        method: "DELETE",
      })
      const closeSessionData = await closeSessionResponse.json()
      console.log("✅ Respuesta:", closeSessionData)
    } else {
      console.log("\n⚠️ No hay sesiones para cerrar")
    }

    console.log("\n🎉 Prueba completada con éxito!")
  } catch (error) {
    console.error("❌ Error durante la prueba:", error)
  }
}

testSesionesReales()
