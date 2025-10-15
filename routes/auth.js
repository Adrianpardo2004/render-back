import express from "express";
import { recuperarPassword, login, verifyToken, cambiarPassword } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login
router.post("/login", login);

// 📧 Recuperar contraseña
router.post("/recuperar", recuperarPassword);

// 🔄 Cambiar contraseña
router.post("/cambiar-password", cambiarPassword);

// ✅ Verificar token (para Dashboard)
router.get("/verify", verifyToken);

export default router;
