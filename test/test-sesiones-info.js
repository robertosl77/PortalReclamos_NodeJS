// Script para probar la API de sesiones con información adicional
import fetch from "node-fetch"
import fs from "fs"

async function testSesionesInfo() {
  try {
    console.log("🧪 Probando API de sesiones con información adicional...")

    // 1. Listar sesiones activas con información adicional
    console.log("1️⃣ Listando sesiones activas con información adicional...")
    const listSessionsResponse = await fetch("http://localhost:8081/api/sesiones")
    const listSessionsData = await listSessionsResponse.json()
    console.log("✅ Sesiones activas:", JSON.stringify(listSessionsData, null, 2))

    // Si hay sesiones, probar obtener foto de perfil
    const sessionIds = Object.keys(listSessionsData.sesiones || {})
    if (sessionIds.length > 0) {
      for (const sessionId of sessionIds) {
        const sesion = listSessionsData.sesiones[sessionId]

        if (sesion.usuario.tieneFoto) {
          console.log(`\n2️⃣ Obteniendo foto de perfil para la sesión ${sessionId}...`)

          const fotoResponse = await fetch(`http://localhost:8081/api/sesiones/${sessionId}/foto`)

          if (fotoResponse.ok) {
            const buffer = await fotoResponse.buffer()
            console.log(`✅ Foto obtenida: ${buffer.length} bytes`)

            // Guardar la foto en un archivo para verificar
            const fileName = `foto_${sesion.usuario.username}.jpg`
            fs.writeFileSync(fileName, buffer)
            console.log(`✅ Foto guardada en ${fileName}`)
          } else {
            console.log(`❌ Error al obtener la foto: ${fotoResponse.status} ${fotoResponse.statusText}`)
          }
        } else {
          console.log(`\n⚠️ El usuario ${sesion.usuario.username} no tiene foto de perfil`)
        }
      }
    } else {
      console.log("\n⚠️ No hay sesiones activas")
    }

    console.log("\n🎉 Prueba completada con éxito!")
  } catch (error) {
    console.error("❌ Error durante la prueba:", error)
  }
}

testSesionesInfo()
