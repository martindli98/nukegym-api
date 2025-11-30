import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useMembership } from "../hooks/useMembership";

function Progress() {
  const [error, setError] = useState();

  const [routines, setRoutines] = useState();
  const [routineDetails, setRoutineDetails] = useState();

  const navigate = useNavigate();
  const { membership, loading: loadingMembership } = useMembership();

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

      const progresos = routine.ejercicios
        .map((ej) => {
          const peso = e.target[`peso_${ej.id}`]?.value;
          const repeticiones =
            e.target[`repeticiones_${ej.id}`]?.value || ej.repeticiones || null;
          return {
            id_ejercicio: ej.id,
            peso: peso ? Number(peso) : null,
            repeticiones: Number(repeticiones),
          };
        })
        .filter((p) => p.peso !== null && p.peso > 0);

      if (progresos.length === 0) {
        toast.error("Debes ingresar al menos un peso para guardar el progreso");
        return;
      }

      const response = await axios.post(
        "http://localhost:3000/api/progress/add",
        {
          id_rutina: routineId,
          progresos,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Progreso guardado correctamente");
        e.target.reset();
      } else {
        setError(response.data.message || "No se pudo guardar el progreso");
      }
    } catch (err) {
      console.error(
        "Error al guardar progreso:",
        err.response?.data || err.message
      );
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
    if (membership?.membershipActive) {
      getRoutineUser();
    }
  }, [membership]);

  if (loadingMembership)
    return <p className="text-center">Verificando membresía...</p>;

  if (!membership?.membershipActive) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Membresía inactiva</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener una membresía activa para ver tu progreso.
        </p>
        <button
          onClick={() => navigate("/membership")}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Ir a membresía
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <button
        onClick={() => navigate("/routine")}
        className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold text-lg"
      >
        ← Volver
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white animate-fadeInUp">
        Progreso de Entrenamiento
      </h2>

      {routines && routines.length > 0 ? (
        <div className="space-y-10 animate-fadeInUp">
          {routines.map((routine, index) => (
            <form
              key={routine.id}
              onSubmit={(e) => handleSubmit(e, routine.id)}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
            >
              {/* Título */}
              <h3 className="text-orange-500 dark:text-orange-5200 text-2xl font-semibold mb-4">
                Rutina {index + 1} – {routine.objetivo || "Sin objetivo"}
              </h3>

              {/* Tabla */}
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-blue-900/20 dark:bg-gray-900/80 text-orange-500 uppercase text-sm font-semibold">
                    <tr>
                      <th className="py-3 px-4 border-b dark:border-gray-700 text-left">
                        Ejercicio
                      </th>
                      <th className="py-3 px-4 border-b dark:border-gray-700 text-center">
                        Series
                      </th>
                      <th className="py-3 px-4 border-b dark:border-gray-700 text-center">
                        Repeticiones
                      </th>
                      <th className="py-3 px-4 border-b dark:border-gray-700 text-center">
                        Peso (kg )
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {routine.ejercicios && routine.ejercicios.length > 0 ? (
                      routine.ejercicios.map((ej) => (
                        <tr
                          key={ej.id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <td className="py-3 px-4 border-b dark:border-gray-700 text-gray-700 dark:text-gray-300">
                            {ej.nombre}
                          </td>

                          <td className="py-3 px-4 border-b dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">
                            {ej.series || "-"}
                          </td>

                          <td className="py-3 px-4 border-b dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">
                            {ej.repeticiones || "-"}
                          </td>

                          <td className="py-3 px-4 border-b dark:border-gray-700 text-center">
                            <input
                              type="number"
                              name={`peso_${ej.id}`}
                              placeholder="Peso"
                              min={1}
                              max={1000}
                              step="0.5"
                              className="w-24 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg p-1.5 text-center text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-center text-gray-500 dark:text-gray-400 py-4 italic"
                        >
                          No hay ejercicios en esta rutina
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Botones */}
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => handleVerProgreso(routine.id)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition shadow-sm"
                >
                  Ver grafico del progreso
                </button>

                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition shadow-sm"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic mt-4">
          Cargando rutinas o no hay ninguna disponible...
        </p>
      )}
    </div>
  );
}

export default Progress;
