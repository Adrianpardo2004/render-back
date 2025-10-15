import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// 🧠 Cargar variables de entorno primero
dotenv.config();

import empleadoRoutes from "./routes/empleados.js";
import contratoRoutes from "./routes/contratos.js";
import authRoutes from "./routes/auth.js";

const app = express();

// 🧱 Middlewares
const allowedOrigins = [
  "https://lighthearted-churros-df6157.netlify.app/", // tu frontend en Netlify
  "http://localhost:5173", // para desarrollo local
];

app.use(cors({
  origin: allowedOrigins,   // 👈 aquí usamos directamente el array
  credentials: true,        // habilita envío de cookies o headers de auth
}));

app.use(express.json());

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB conectado"))
  .catch((err) => console.error("❌ Error al conectar MongoDB:", err.message));

// 📦 Rutas principales
app.use("/api/empleados", empleadoRoutes);
app.use("/api/contratos", contratoRoutes);
app.use("/api/auth", authRoutes);

// 🚀 Servidor en marcha
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT} 🚀`));
