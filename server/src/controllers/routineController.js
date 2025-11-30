import { RoutineModel } from "../models/routineModel.js";

const handleError = (res, error, message, status = 500) => {
  console.error(error);
  res.status(status).json({ success: false, message });
};

export const createRutine = async (req, res) => {
  try {
    const { id_usuario, id_entrenador, fecha, objetivo, ejercicios } = req.body;
    if (!id_usuario || !ejercicios?.length)
      return res.status(400).json({ message: "Faltan datos obligatorios" });

    console.log(
      "🟢 createRutine - body incoming:",
      JSON.stringify(req.body, null, 2)
    );
    const id = await RoutineModel.createRutine({
      id_usuario,
      id_entrenador,
      fecha,
      objetivo,
      ejercicios,
    });
    res.status(201).json({ message: "Rutina creada", id });
  } catch (error) {
    handleError(res, error, "Error al crear rutina");
  }
};

export const getRoutineByUser = async (req, res) => {
  try {
    const rutinas = await RoutineModel.listByUser(req.user.id);
    res.json({ success: true, routines: rutinas });
  } catch (error) {
    handleError(res, error, "Error al obtener rutinas");
  }
};

export const getRoutineByUserId = async (req, res) => {
  try {
    const rutinas = await RoutineModel.listByUser(req.params.userId);
    res.json({ success: true, routines: rutinas });
  } catch (error) {
    handleError(res, error, "Error al obtener rutinas");
  }
};

export const getRoutineDetails = async (req, res) => {
  try {
    res.json(await RoutineModel.getRutine(req.params.id));
  } catch (error) {
    handleError(res, error, "Error al obtener detalle");
  }
};

export const updateRoutineName = async (req, res) => {
  try {
    const updated = await RoutineModel.updateRoutineName(
      req.params.id,
      req.user.id,
      req.body.objetivo
    );
    updated
      ? res.json({ success: true, message: "Nombre actualizado" })
      : res
          .status(404)
          .json({ success: false, message: "Rutina no encontrada" });
  } catch (error) {
    handleError(res, error, "Error al actualizar");
  }
};

export const updateExercise = async (req, res) => {
  try {
    const { id_rutina, id_ejercicio } = req.params;
    const { series, repeticiones } = req.body;
    const updated = await RoutineModel.updateExercise(
      id_rutina,
      id_ejercicio,
      series,
      repeticiones
    );
    updated
      ? res.json({ success: true, message: "Ejercicio actualizado" })
      : res
          .status(404)
          .json({ success: false, message: "Ejercicio no encontrado" });
  } catch (error) {
    handleError(res, error, "Error al actualizar");
  }
};

export const addExercises = async (req, res) => {
  try {
    const { ejercicios } = req.body;
    if (!ejercicios?.length)
      return res
        .status(400)
        .json({ success: false, message: "No se enviaron ejercicios" });

    await RoutineModel.addExercises(req.params.id, ejercicios);
    res.json({ success: true, message: "Ejercicios agregados" });
  } catch (error) {
    handleError(res, error, "Error al agregar ejercicios");
  }
};

export const deleteExercise = async (req, res) => {
  try {
    const { id_rutina, id_ejercicio } = req.params;
    const deleted = await RoutineModel.deleteExercise(id_rutina, id_ejercicio);
    deleted
      ? res.json({ success: true, message: "Ejercicio eliminado" })
      : res
          .status(404)
          .json({ success: false, message: "Ejercicio no encontrado" });
  } catch (error) {
    handleError(res, error, "Error al eliminar");
  }
};

export const deleteRutine = async (req, res) => {
  try {
    const result = await RoutineModel.deleteRutine(req.params.id, req.user.id);
    result.success ? res.json(result) : res.status(404).json(result);
  } catch (error) {
    handleError(res, error, "Error al eliminar rutina");
  }
};
