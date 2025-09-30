import React, { useEffect, useState } from "react";
import axios from "axios";
import RoutineCard from "../components/Routine/RoutineCard";

const Routine = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      const options = {
        method: "GET",
        url: "https://v2.exercisedb.dev/api/v1/exercises",
        params: {
          limit: 9,
        },
      };

      try {
        const { data } = await axios.request(options);
        console.log("API Response:", data);
        console.log("First exercise example:", data.data?.[0]);

        // Verificar si la respuesta tiene la estructura esperada
        if (data.success && Array.isArray(data.data)) {
          setExercises(data.data);
        } else {
          console.warn("Unexpected API response format:", data);
          setExercises([]);
          setError("Formato de respuesta inesperado de la API");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching exercises:", error);
        setError("Error al cargar los ejercicios: " + error.message);
        setExercises([]);
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center mb-8 border-b-4 border-orange-500 pb-4 inline-block w-full">
        Ejercicios
      </h1>

      {loading ? (
        <div className="text-center text-gray-700 py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-base sm:text-lg font-semibold">
            Cargando ejercicios...
          </p>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-xl border-2 border-red-200 shadow-lg">
          <p className="text-base sm:text-lg font-semibold">{error}</p>
        </div>
      ) : exercises.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exercises.map((exercise) => (
            <RoutineCard key={exercise.exerciseId} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600 bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-xl shadow-lg border-2 border-orange-200">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-orange-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            No se encontraron ejercicios
          </p>
          <p className="text-sm sm:text-base text-gray-600">
            Intenta ajustar los parámetros de búsqueda.
          </p>
        </div>
      )}
    </div>
  );
};

export default Routine;
