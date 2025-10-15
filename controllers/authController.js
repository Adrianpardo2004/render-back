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
    if (!empleado)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const passwordValido = password === empleado.password;
    if (!passwordValido)
      return res.status(401).json({ message: "Contraseña incorrecta" });

    // ✅ Solo RRHH puede acceder
    if (empleado.cargo !== "RRHH") {
      return res.status(403).json({
        message: "Acceso denegado. Solo personal de RRHH puede ingresar.",
      });
    }

    const token = jwt.sign(
      {
        id: empleado._id,
        nombre: empleado.nombre,
        cargo: empleado.cargo,
        correo: empleado.correo,
      },
      "claveSecretaJWT", // misma clave en verifyToken
      { expiresIn: "4h" }
    );

    res.json({
      message: "Inicio de sesión exitoso",
      token,
      empleado: {
        id: empleado._id,
        nombre: empleado.nombre,
        correo: empleado.correo,
        cargo: empleado.cargo, // 👈 se usa cargo, no rol
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

// 📧 Recuperar contraseña (envía link con token)
export const recuperarPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const empleado = await Empleado.findOne({ correo });
    if (!empleado)
      return res.status(404).json({ message: "Correo no encontrado" });

    // Crear token válido por 15 minutos
    const token = jwt.sign(
      { id: empleado._id, correo: empleado.correo },
      "claveSecretaJWT",
      { expiresIn: "15m" }
    );

    // ✅ Detectar entorno y usar URL correcta
    const FRONTEND_URL =
      process.env.NODE_ENV === "production"
        ? "https://melodious-tanuki-f37cef.netlify.app"
        : "http://localhost:3000";

    const link = `${FRONTEND_URL}/cambiar-password?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: "no-reply@resend.dev",
      to: correo,
      subject: "Recuperar contraseña - SIRH Molino",
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola <strong>${empleado.nombre}</strong>,</p>
        <p>Puedes cambiar tu contraseña haciendo clic en el siguiente enlace:</p>
        <p><a href="${link}">Cambiar mi contraseña</a></p>
        <p>Este enlace expirará en 15 minutos.</p>
      `,
    });

    if (error) {
      console.error("Error enviando correo:", error);
      return res.status(500).json({ message: "Error enviando correo", error });
    }

    res.json({ message: "Correo enviado correctamente", data });
  } catch (err) {
    console.error("❌ Error en recuperación:", err);
    res
      .status(500)
      .json({ message: "Error en el servidor", error: err.message });
  }
};

// 🔄 Cambiar contraseña
export const cambiarPassword = async (req, res) => {
  const { token, nuevaPassword } = req.body;

  try {
    const decoded = jwt.verify(token, "claveSecretaJWT");
    const empleado = await Empleado.findById(decoded.id);
    if (!empleado)
      return res.status(404).json({ message: "Usuario no encontrado" });

    empleado.password = nuevaPassword;
    await empleado.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error al cambiar contraseña:", error);
    res.status(400).json({ message: "Token inválido o expirado" });
  }
};

// ✅ Middleware para verificar token JWT
export const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, "claveSecretaJWT"); // misma clave que arriba
    req.user = decoded;
    next(); // continúa con la ruta protegida
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
