import Empleado from "../models/Empleado.js";
import { Resend } from "resend";
import jwt from "jsonwebtoken";

// Inicializa Resend con tu API Key
const resend = new Resend("re_SMuLdV6o_3zc6YhhL7kvWNkFxK6BxK1hM");

// 🔐 Iniciar sesión
export const login = async (req, res) => {
  const { correo, password } = req.body;

  try {
    const empleado = await Empleado.findOne({ correo });
    if (!empleado) return res.status(404).json({ message: "Usuario no encontrado" });

    const passwordValido = (password === empleado.password);
    if (!passwordValido) return res.status(401).json({ message: "Contraseña incorrecta" });

    // Generar token JWT
    const token = jwt.sign(
      { id: empleado._id, nombre: empleado.nombre, rol: empleado.rol, correo: empleado.correo },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      empleado: {
        id: empleado._id,
        nombre: empleado.nombre,
        correo: empleado.correo,
        rol: empleado.rol
      }
    });

  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// 📧 Recuperar contraseña usando Resend
export const recuperarPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const empleado = await Empleado.findOne({ correo });
    if (!empleado) return res.status(404).json({ message: "Correo no encontrado" });

    // Enviar correo con la contraseña
    const { data, error } = await resend.emails.send({
      from: "no-reply@resend.dev",
      to: correo,
      subject: "Recuperación de contraseña - SIRH Molino",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola <strong>${empleado.nombre}</strong>,</p>
        <p>Tu contraseña es: <strong>${empleado.password}</strong></p>
        <p>Por favor, cámbiala después de iniciar sesión.</p>
      `
    });

    if (error) {
      console.error("Error enviando correo:", error);
      return res.status(500).json({ message: "Error enviando correo", error });
    }

    res.json({ message: "Correo enviado correctamente", data });

  } catch (err) {
    console.error("❌ Error en recuperación:", err);
    res.status(500).json({ message: "Error en el servidor", error: err.message });
  }
};

// ✅ Verificar token (para proteger Dashboard)
export const verifyToken = (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: "Token inválido o expirado" });
  }
};
