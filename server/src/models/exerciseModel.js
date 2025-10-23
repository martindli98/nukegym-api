import { pool } from "../config/db.js"

export const ExerciseModel = {
    async getAll() {
        const [rows] = await pool.query("SELECT * FROM Ejercicio")
        return rows
    },

    async getExerciseByName(name) {
        const [rows] = await pool.query("SELECT * FROM Ejercicio WHERE name = ?", [name])
        return [rows]
    }
} 
