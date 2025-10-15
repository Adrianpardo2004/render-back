import mongoose from "mongoose";

const contratoSchema = new mongoose.Schema({
  fecha_inicio: Date,
  fecha_fin: Date,
  valor: Number,
  cargo: String,
  observacion: String, // ✅ Nuevo campo agregado
  empleado_id: { type: mongoose.Schema.Types.ObjectId, ref: "Empleado" },
});

export default mongoose.model("Contrato", contratoSchema);
