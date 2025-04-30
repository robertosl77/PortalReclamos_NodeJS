import express from "express"
import authRoutes from "./routes/auth.routes.js"
import reclamosRoutes from "./routes/reclamos.routes.js"
import sessionRoutes from "./routes/session.routes.js" // Nueva importación
import session from "express-session"
import MemoryStore from "memorystore"

const app = express()

// Crear un store de memoria explícito
const MemoryStoreSession = MemoryStore(session)
export const sessionStore = new MemoryStoreSession({
  checkPeriod: 86400000, // Limpia sesiones expiradas cada 24h
})

// Middleware para manejo de sesiones
app.use(
  session({
    secret: "clave_secreta_segura",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 10 * 60 * 1000, // 10 minutos
    },
  }),
)

app.use(express.urlencoded({ extended: true }))
app.use(express.json()) // Para poder procesar JSON en las peticiones

// Middleware para registrar todas las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Rutas de API
app.use("/api", authRoutes)
app.use("/api", reclamosRoutes)
app.use("/api", sessionRoutes) // Nuevas rutas de sesión

// Redirecciones
app.get("/", (req, res) => {
  res.redirect("/PortalReclamos/login.html")
})

app.get("/PortalReclamos", (req, res) => {
  res.redirect("/PortalReclamos/login.html")
})

// Archivos estáticos
app.use("/PortalReclamos", express.static("public"))

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error("❌ Error no controlado:", err)
  res.status(500).json({
    error: "Error interno del servidor",
    message: process.env.NODE_ENV === "production" ? "Ocurrió un error inesperado" : err.message,
  })
})

export default app
