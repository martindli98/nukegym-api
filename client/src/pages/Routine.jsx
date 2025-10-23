import React, { useEffect, useState } from "react";
import axios from "axios";
import RoutineCard from "../components/Routine/RoutineCard";
import CreateRoutineModal from "../components/Routine/CreateRoutineModal";

const Routine = () => {
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const userSession = JSON.parse(sessionStorage.getItem("userData"));
  const user = userSession?.userData || null;

  useEffect(() => {
    fetchRoutines();
  }, []);

  const fetchRoutines = async () => {
    const token = sessionStorage.getItem("authToken");
    if (!token) {
      setError("Debes iniciar sesión para ver tus rutinas.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:3000/api/routine/user",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setRoutines(response.data.routines);
      } else {
        setRoutines([]);
      }
    } catch (err) {
      console.error("Error al cargar rutinas:", err);
      setError("No se pudieron cargar las rutinas.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center p-4">Cargando rutinas...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md m-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
          Tus Rutinas
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
        >
          Armar rutina
        </button>
      </div>

      {showModal && (
        <CreateRoutineModal
          studentId={user?.id}
          trainerId={null}
          onClose={() => {
            setShowModal(false);
            fetchRoutines();
          }}
        />
      )}

      {selectedRoutine ? (
        <>
          <button
            onClick={() => setSelectedRoutine(null)}
            className="mb-4 text-orange-500 hover:underline"
          >
            ← Volver a todas las rutinas
          </button>

          <h3 className="text-2xl font-semibold text-orange-600 mb-2">
            {selectedRoutine.objetivo}
          </h3>
          <p className="text-gray-600 mb-4">
            <strong>Fecha:</strong>{" "}
            {new Date(selectedRoutine.fecha).toLocaleDateString()}
          </p>

          <div className="flex flex-col">
            {selectedRoutine.ejercicios.length > 0 ? (
              selectedRoutine.ejercicios
                .slice()
                .sort((a, b) => (a.orden ?? a.id) - (b.orden ?? b.id))
                .map((e, index) => (
                  <RoutineCard key={e.id} ejercicio={e} index={index} />
                ))
            ) : (
              <p className="text-gray-500">No hay ejercicios asignados.</p>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                const confirmDelete = window.confirm(
                  "¿Seguro que deseas eliminar esta rutina? Esta acción no se puede deshacer."
                );
                if (!confirmDelete) return;
                try {
                  const token = sessionStorage.getItem("authToken");
                  await axios.delete(
                    `http://localhost:3000/api/routine/${selectedRoutine.id}`,
                    {
                      headers: { Authorization: `Bearer ${token}` },
                    }
                  );
                  setRoutines((prev) =>
                    prev.filter((r) => r.id !== selectedRoutine.id)
                  );
                  setSelectedRoutine(null);
                  alert("Rutina eliminada correctamente 🗑️");
                } catch (err) {
                  console.error("Error al eliminar rutina:", err);
                  alert("Error al eliminar la rutina");
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </button>
          </div>
        </>
      ) : routines.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 text-center">
          {routines.map((r) => (
            <div
              key={r.id}
              onClick={() => setSelectedRoutine(r)}
              className="cursor-pointer border border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-orange-500 mb-2">
                {r.objetivo}
              </h3>
              <p className="text-gray-600">
                <strong>Fecha:</strong> {new Date(r.fecha).toLocaleDateString()}
              </p>
              <p className="text-gray-500 mt-2">
                {r.ejercicios.length} ejercicios
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600 text-center">
          No tienes rutinas asignadas aún.
        </p>
      )}
    </div>
  );
};

export default Routine;
