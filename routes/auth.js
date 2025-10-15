import express from "express";
import { recuperarPassword, login, verifyToken } from "../controllers/authController.js";

const router = express.Router();

// 🔐 Login
router.post("/login", login);

// 📧 Recuperar contraseña
router.post("/recuperar", recuperarPassword);

// ✅ Verificar token (para Dashboard)
router.get("/verify", verifyToken);

export default router;
