// Script para probar la funcionalidad de sesiones
import fetch from "node-fetch"

async function testSessions() {
  try {
    console.log("🧪 Probando API de sesiones...")

    // 1. Verificar que el servidor está funcionando
    console.log("1️⃣ Verificando que el servidor está funcionando...")
    const pingResponse = await fetch("http://localhost:8081/api/ping")
    const pingData = await pingResponse.json()
    console.log("✅ Servidor respondió:", pingData)

    // 2. Crear una sesión de prueba
    console.log("\n2️⃣ Creando una sesión de prueba...")
    const createSessionResponse = await fetch("http://localhost:8081/api/crear-sesion-prueba", {
      credentials: "include",
    })
    const createSessionData = await createSessionResponse.json()
    console.log("✅ Respuesta:", createSessionData)

    // 3. Listar las sesiones
    console.log("\n3️⃣ Listando todas las sesiones...")
    const listSessionsResponse = await fetch("http://localhost:8081/api/test-sessions")
    const listSessionsData = await listSessionsResponse.json()
    console.log("✅ Sesiones activas:", listSessionsData)

    console.log("\n🎉 Prueba completada con éxito!")
  } catch (error) {
    console.error("❌ Error durante la prueba:", error)
  }
}

testSessions()
