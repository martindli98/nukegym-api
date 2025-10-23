import { ExerciseModel } from "../models/exerciseModel.js";

export const getAllExercises = async (req, res) => {
  try {
    const exercises = await ExerciseModel.getAll();
    res.json(exercises);
  } catch (error) {
    console.error("Error al obtener ejercicios:", error);
    res.status(500).json({ message: "Error al obtener ejercicios" });
  }
};
