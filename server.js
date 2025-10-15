import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import empleadoRoutes from "./routes/empleados.js";
import contratoRoutes from "./routes/contratos.js";
import authRoutes from "./routes/auth.js";

const app = express();

// 🧱 Configuración CORS
const allowedOrigins = [
  "https://melodious-tanuki-f37cef.netlify.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// 🔌 Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err.message));

// 📦 Rutas principales
app.use("/api/empleados", empleadoRoutes);
app.use("/api/contratos", contratoRoutes);
app.use("/api/auth", authRoutes);

// 🧭 Ruta base para verificar estado
app.get("/", (req, res) => {
  res.send("🚀 API SIRH Molino funcionando correctamente");
});

// 🚀 Servidor en marcha
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT} 🚀`));
