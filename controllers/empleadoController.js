import Empleado from "../models/Empleado.js";
import Contrato from "../models/Contrato.js";

// ✅ Validación general
const validarEmpleado = (data) => {
  const { nro_documento, nombre, apellido, edad, genero, correo, password } = data;

  // Si todos los campos vienen como "0" o vacíos
  const todosCeroOVacios = [nro_documento, nombre, apellido, edad, genero, correo, password]
    .every((v) => v === "0" || v === 0 || v === "" || v === null || v === undefined);
  if (todosCeroOVacios) {
    throw new Error("❌ No puedes ingresar todos los campos con valor cero o vacíos.");
  }

  if (edad < 18 || edad > 100) {
    throw new Error("❌ La edad debe estar entre 18 y 100 años.");
  }

  if (!["Masculino", "Femenino", "Otro"].includes(genero)) {
    throw new Error("❌ El género debe ser Masculino, Femenino u Otro.");
  }
};

// Listar todos los empleados
export const getEmpleados = async (req, res) => {
  try {
    const empleados = await Empleado.find();
    res.json(empleados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear empleado
export const createEmpleado = async (req, res) => {
  try {
    validarEmpleado(req.body);

    const { nro_documento, nombre, apellido, edad, genero, cargo, estado, correo, password } = req.body;
    const nuevoEmpleado = new Empleado({
      nro_documento,
      nombre,
      apellido,
      edad,
      genero,
      cargo,
      estado,
      correo,
      password,
    });

    const savedEmpleado = await nuevoEmpleado.save();
    res.status(201).json(savedEmpleado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Actualizar empleado
export const updateEmpleado = async (req, res) => {
  try {
    validarEmpleado(req.body);

    const { nro_documento, nombre, apellido, edad, genero, cargo, estado, correo, password } = req.body;
    const updated = await Empleado.findByIdAndUpdate(
      req.params.id,
      { nro_documento, nombre, apellido, edad, genero, cargo, estado, correo, password },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Empleado no encontrado" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Eliminar empleado
export const deleteEmpleado = async (req, res) => {
  try {
    await Empleado.findByIdAndDelete(req.params.id);
    await Contrato.deleteMany({ empleado_id: req.params.id });
    res.json({ message: "Empleado y contratos eliminados" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Buscar empleado
export const buscarEmpleado = async (req, res) => {
  try {
    const { q } = req.query;
    const empleado = await Empleado.findOne({
      $or: [
        { nro_documento: q },
        { nombre: { $regex: q, $options: "i" } },
      ],
    });

    if (!empleado) return res.status(404).json({ message: "Empleado no encontrado" });

    const contratos = await Contrato.find({ empleado_id: empleado._id });
    res.json({ empleado, contratos, cantidad_contratos: contratos.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
