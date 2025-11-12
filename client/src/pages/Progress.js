import React, {  useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Progress() {

const [error,setError]= useState();

const [routines,setRoutines]=useState();
const [routineDetails,setRoutineDetails]=useState();

const navigate = useNavigate();

  const handleVerProgreso = (idRutina) => {
    navigate(`/progresscomplete/${idRutina}`);
  };

const handleSubmit = async (e, routineId) => {
  e.preventDefault();

  const token = sessionStorage.getItem("authToken");
  if (!token) {
    setError("Debes iniciar sesión para guardar tu progreso.");
    return;
  }

  try {
    const routine = routines.find((r) => r.id === routineId);

    const progresos = routine.ejercicios.map((ej) => {
      const peso = e.target[`peso_${ej.id}`]?.value || null;
      const repeticiones = e.target[`repeticiones_${ej.id}`]?.value || ej.repeticiones || null;
      return {
        id_ejercicio: ej.id,
        peso: Number(peso),
        repeticiones: Number(repeticiones),
      };
    });

    const response = await axios.post(
      "http://localhost:3000/api/progress/add",
      {
        id_rutina: routineId,
        progresos,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {
      alert("✅ Progreso guardado correctamente");
    } else {
      setError(response.data.message || "No se pudo guardar el progreso");
    }
  } catch (err) {
    console.error("Error al guardar progreso:", err.response?.data || err.message);
    setError("Error al guardar el progreso");
  }
};



const getRoutineUser = async () => {
  const token = sessionStorage.getItem("authToken");
  if (!token) {
    setError("Debes iniciar sesión para ver tu membresía.");
    return;
  }

  try {
    const response = await axios.get(
      "http://localhost:3000/api/progress/routine",
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.data.success) {

      setRoutines(response.data.routines);

    } else {
      setError(response.data.message || "No se pudo obtener la rutina");
    }
  } catch (err) {
    console.log("Error Axios:", err.response?.data || err.message);
    setError("Error al consultar la rutina");
  }
};

useEffect(() => {
  getRoutineUser();  // se ejecuta una sola vez
}, []);


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Progreso de Entrenamiento
      </h2>

      {/* Si existen rutinas */}
      {routines && routines.length > 0 ? (
        <div className="space-y-10">
          {routines.map((routine, index) => (
            <form
              key={routine.id}
              onSubmit={(e) => handleSubmit(e, routine.id)} // guarda los progresos
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
            >
              {/* 🔹 Título de cada rutina */}
              <h3 className="text-2xl font-semibold mb-4 text-gray-700">
                Rutina {index + 1} – {routine.objetivo || "Sin objetivo"}
              </h3>

              {/* 🔹 Tabla con los ejercicios de la rutina */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-blue-100 text-blue-800 uppercase text-sm font-semibold">
                    <tr>
                      <th className="py-3 px-4 border-b text-left">Ejercicio</th>
                      <th className="py-3 px-4 border-b text-center">Series</th>
                      <th className="py-3 px-4 border-b text-center">
                        Repeticiones
                      </th>
                      <th className="py-3 px-4 border-b text-center">
                        Peso (kg)
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* 🔹 Si hay ejercicios, los muestra */}
                    {routine.ejercicios && routine.ejercicios.length > 0 ? (
                      routine.ejercicios.map((ej) => (
                        <tr
                          key={ej.id}
                          className="hover:bg-gray-50 transition duration-150"
                        >
                          <td className="py-3 px-4 border-b text-gray-700">
                            {ej.nombre}
                          </td>
                          <td className="py-3 px-4 border-b text-center text-gray-700">
                            {ej.series || "-"}
                          </td>
                          <td className="py-3 px-4 border-b text-center text-gray-700">
                            {ej.repeticiones || "-"}
                          </td>
                          <td className="py-3 px-4 border-b text-center">
                            <input
                              type="number"
                              name={`peso_${ej.id}`}
                              placeholder="Peso"
                              className="w-24 border border-gray-300 rounded-lg p-1.5 text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      // 🔹 Si no hay ejercicios en la rutina
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center text-gray-500 py-4 italic"
                        >
                          No hay ejercicios en esta rutina
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* 🔹 Botones de acción */}
              <div className="flex justify-between mt-6">
                
                <button
                  type="button"
                  onClick={() => handleVerProgreso(routine.id)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                  Ver progreso completo
                </button>
                {/* Guardar cambios */}
                <button
                  type="submit"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
                >
                  Guardar cambios
                </button>

                {/* Ver progreso completo */}
              </div>
            </form>
          ))}
        </div>
      ) : (
        // 🔹 Si no hay rutinas cargadas
        <p className="text-center text-gray-500 italic mt-4">
          Cargando rutinas o no hay ninguna disponible...
        </p>
      )}
    </div>
  );
};


export default Progress;