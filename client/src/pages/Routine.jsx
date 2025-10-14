import React, { useEffect, useState } from "react";
import axios from "axios";
import RoutineCard from "../components/Routine/RoutineCard";

const Routine = () => {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoutine = async () => {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        setError("Debes iniciar sesión para ver tu rutina.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/routine/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const { data } = response;

        if (data.routineExists) {
          setRoutine(data.data);
        } else {
          setRoutine(null);
        }
      } catch (err) {
        console.error("Error al cargar la rutina:", err);
        setError("No se pudo cargar la rutina.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoutine();
  }, []);

  // 🔄 Estados de carga / error
  if (loading) {
    return (
      <p className="text-center text-gray-700 dark:text-gray-300 py-8">
        Cargando rutina...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 p-4 rounded">
        {error}
      </p>
    );
  }

  // 🏋️‍♀️ Render principal
  return (
    <div className="routine-container max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md m-10">
      {routine ? (
        <>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
            Tu rutina asignada
          </h2>

          <p className="text-gray-700 dark:text-gray-300">
            <strong>Fecha:</strong>{" "}
            {new Date(routine.fecha).toLocaleDateString()}
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            <strong>Objetivo:</strong> {routine.objetivo}
          </p>

          <h3 className="mt-6 text-2xl font-semibold text-orange-500">
            Ejercicios:
          </h3>

          {routine.ejercicios?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {routine.ejercicios.map((ejercicio) => (
                <RoutineCard key={ejercicio.id} ejercicio={ejercicio} />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              No hay ejercicios asignados a esta rutina.
            </p>
          )}
        </>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          No tienes una rutina asignada.
        </p>
      )}
    </div>
  );
};

export default Routine;

