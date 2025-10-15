import mongoose from "mongoose";

const empleadoSchema = new mongoose.Schema({
  nro_documento: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  edad: {
    type: Number,
    required: true,
    min: [18, "La edad mínima es 18 años"],
    max: [100, "La edad máxima es 100 años"],
  },
  genero: {
    type: String,
    enum: ["Masculino", "Femenino", "Otro"],
    required: true,
  },
  cargo: String,
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nro_contacto: String,
  estado: { type: String, enum: ["activo", "retirado"], default: "activo" },
  observaciones: [String],
});

export default mongoose.model("Empleado", empleadoSchema);
