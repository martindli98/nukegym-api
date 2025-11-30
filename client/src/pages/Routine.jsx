import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import RoutineCard from "../components/Routine/RoutineCard";
import CreateRoutineModal from "../components/Routine/CreateRoutineModal";
import AddExercisesModal from "../components/Routine/AddExercisesModal";
import { useNavigate } from "react-router-dom";
import { useMembership } from "../hooks/useMembership";
import { toast } from "react-toastify";
import ConfirmModal from "../components/confirmModal/confirmModal";

const Routine = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showAddExercises, setShowAddExercises] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [routineToDelete, setRoutineToDelete] = useState(null);
  const [showConfirmExercise, setShowConfirmExercise] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const editNameRef = useRef(null);

  const { membership, loading: loadingMembership } = useMembership();

  const userSession = JSON.parse(sessionStorage.getItem("userData"));
  const user = userSession?.userData || null;

  useEffect(() => {
    if (membership?.membershipActive) {
      fetchRoutines();
    }
  }, [membership]);

  // Manejar cancelación automática al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!isEditingName) return;

    const handleClickOutside = (event) => {
      if (editNameRef.current && !editNameRef.current.contains(event.target)) {
        setIsEditingName(false);
        setEditedName(selectedRoutine?.objetivo || "");
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsEditingName(false);
        setEditedName(selectedRoutine?.objetivo || "");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isEditingName, selectedRoutine]);

  const handleUpdateRoutineName = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3000/api/routine/${selectedRoutine.id}/name`,
        { objetivo: editedName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSelectedRoutine({ ...selectedRoutine, objetivo: editedName });
      setRoutines(
        routines.map((r) =>
          r.id === selectedRoutine.id ? { ...r, objetivo: editedName } : r
        )
      );
      setIsEditingName(false);
      toast.success("Nombre actualizado");
    } catch (error) {
      toast.error("Error al actualizar nombre", { autoClose: 6000 });
    }
  };

  const handleAddExercises = async (ejercicios) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.post(
        `http://localhost:3000/api/routine/${selectedRoutine.id}/exercises`,
        { ejercicios },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const res = await axios.get(
        `http://localhost:3000/api/routine/${selectedRoutine.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedRoutine(res.data);

      toast.success("Ejercicios agregados");
      setShowAddExercises(false);
    } catch (error) {
      toast.error("Error al agregar ejercicios");
    }
  };

  const handleUpdateExercise = async (ejercicioId, series, repeticiones) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3000/api/routine/${selectedRoutine.id}/exercise/${ejercicioId}`,
        { series, repeticiones },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedEjercicios = selectedRoutine.ejercicios.map((e) =>
        e.id === ejercicioId ? { ...e, series, repeticiones } : e
      );
      setSelectedRoutine({ ...selectedRoutine, ejercicios: updatedEjercicios });
      toast.success("Ejercicio actualizado");
    } catch (error) {
      toast.error("Error al actualizar ejercicio");
    }
  };

  const handleDeleteExercise = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.delete(
        `http://localhost:3000/api/routine/${selectedRoutine.id}/exercise/${exerciseToDelete}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedEjercicios = selectedRoutine.ejercicios.filter(
        (e) => e.id !== exerciseToDelete
      );
      setSelectedRoutine({ ...selectedRoutine, ejercicios: updatedEjercicios });
      toast.success("Ejercicio eliminado");
    } catch (error) {
      toast.error("Error al eliminar ejercicio");
    } finally {
      setShowConfirmExercise(false);
      setExerciseToDelete(null);
    }
  };

  const handleDeleteRoutine = async () => {
    try {
      const token = sessionStorage.getItem("authToken");

      await axios.delete(
        `http://localhost:3000/api/routine/${routineToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete.id));
      setSelectedRoutine(null);
      toast.success("Rutina eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la rutina");
    } finally {
      setShowConfirm(false);
      setRoutineToDelete(null);
    }
  };

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

  if (loadingMembership)
    return <p className="text-center">Verificando membresía...</p>;

  if (!membership?.membershipActive) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Membresía inactiva</h2>
        <p className="mt-2 text-gray-600">
          Debes activar tu membresía para ver tus rutinas.
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

  if (loading) return <p className="text-center p-4">Cargando rutinas...</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;

  return (
    <div className="animate-fadeInUp">
      <div className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md m-10">
        <div className="flex justify-between items-center mb-6">
          {!selectedRoutine ? (
            <>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Tus Rutinas
              </h2>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/progress`)}
                  className="bg-orange-600 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
                >
                  Anotar progreso
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded-lg"
                >
                  Armar rutina
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setSelectedRoutine(null)}
              className="inline-flex items-center gap-2 text-white bg-orange-500 font-medium text-lg px-3 py-2 rounded-lg hover:bg-orange-400 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Volver a todas las rutinas</span>
            </button>
          )}
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

        {showAddExercises && (
          <AddExercisesModal
            onClose={() => setShowAddExercises(false)}
            onSubmit={handleAddExercises}
            existingExercises={selectedRoutine?.ejercicios || []}
          />
        )}

        {selectedRoutine ? (
          <>
            <div className="flex items-center gap-3 mb-2">
              {isEditingName ? (
                <div
                  ref={editNameRef}
                  className="flex items-center gap-3 flex-1"
                >
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateRoutineName();
                    }}
                    autoFocus
                    className="flex-1 text-2xl font-semibold text-orange-600 border-2 border-orange-500 rounded px-2 py-1"
                  />
                  <button
                    onClick={handleUpdateRoutineName}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingName(false);
                      setEditedName(selectedRoutine.objetivo);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold text-orange-600">
                    {selectedRoutine.objetivo}
                  </h3>
                  <button
                    onClick={() => {
                      setIsEditingName(true);
                      setEditedName(selectedRoutine.objetivo);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
                  >
                    Editar nombre
                  </button>
                </>
              )}
            </div>
            <p className="text-gray-600 mb-4">
              <strong>Fecha:</strong>{" "}
              {new Date(selectedRoutine.fecha).toLocaleDateString()}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedRoutine.ejercicios.length > 0 ? (
                selectedRoutine.ejercicios
                  .slice()
                  .sort((a, b) => (a.orden ?? a.id) - (b.orden ?? b.id))
                  .map((e, index) => (
                    <RoutineCard
                      key={e.id}
                      ejercicio={e}
                      index={index}
                      onUpdate={handleUpdateExercise}
                      onDelete={(ejercicioId) => {
                        setExerciseToDelete(ejercicioId);
                        setShowConfirmExercise(true);
                      }}
                    />
                  ))
              ) : (
                <p className="text-gray-500">No hay ejercicios asignados.</p>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddExercises(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                Agregar ejercicios
              </button>
              <button
                onClick={async () => {
                  setRoutineToDelete(selectedRoutine);
                  setShowConfirm(true);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : routines.length > 0 ? (
          /* LISTADO DE RUTINAS */
          <div className="grid grid-cols-4 gap-6 text-center hover:-translate-y-1 transition-all duration-100">
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
                  <strong>Fecha:</strong>{" "}
                  {new Date(r.fecha).toLocaleDateString()}
                </p>
                <p className="text-gray-500 mt-2">
                  {r.ejercicios.length} Ejercicios
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
      <ConfirmModal
        isOpen={showConfirm}
        title="Eliminar rutina"
        message="¿Seguro que deseas eliminar esta rutina? Esta acción no se puede deshacer."
        onCancel={() => setShowConfirm(false)}
        onConfirm={handleDeleteRoutine}
      />
      <ConfirmModal
        isOpen={showConfirmExercise}
        title="Eliminar ejercicio"
        message="¿Seguro que deseas eliminar este ejercicio de la rutina?"
        onCancel={() => {
          setShowConfirmExercise(false);
          setExerciseToDelete(null);
        }}
        onConfirm={handleDeleteExercise}
      />
    </div>
  );
};

export default Routine;
