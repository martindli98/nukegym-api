import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreateRoutineModal from "../components/Routine/CreateRoutineModal";
import RoutineCard from "../components/Routine/RoutineCard";
import ConfirmModal from "../components/confirmModal/confirmModal";
import AddExercisesModal from "../components/Routine/AddExercisesModal";
import { useMembership } from "../hooks/useMembership";

const API_URL = "http://localhost:3000/api";
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` },
});

export default function Trainer() {
  const user =
    JSON.parse(sessionStorage.getItem("userData"))?.userData ||
    JSON.parse(sessionStorage.getItem("userData"));
  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTrainerId, setActiveTrainerId] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewRoutineStudent, setViewRoutineStudent] = useState(null);
  const [studentRoutines, setStudentRoutines] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    data: null,
  });
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [showAddExercises, setShowAddExercises] = useState(false);
  const editNameRef = useRef(null);
  const { membership, loading: loadingMembership } = useMembership();

  const apiRequest = async (
    method,
    endpoint,
    data = null,
    errorMsg = "Error en la operación"
  ) => {
    try {
      const config = getAuthHeaders();
      const res = await axios[method](
        `${API_URL}${endpoint}`,
        ...(data ? [data, config] : [config])
      );
      return res.data;
    } catch (error) {
      toast.error(errorMsg);
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user || !membership?.membershipActive) return;
    if (user.id_rol === 2) {
      fetchTrainers();
      setActiveTrainerId(user.id_trainer);
    } else if (user.id_rol === 3) {
      fetchStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchTrainers = async () => {
    try {
      const turno =
        new URLSearchParams(window.location.search).get("turno") || user.turno;
      const url = turno
        ? `${API_URL}/trainers/trainers?turno=${encodeURIComponent(turno)}`
        : `${API_URL}/trainers`;
      const res = await axios.get(url);
      setTrainers(
        Array.isArray(res.data.entrenadores || res.data)
          ? res.data.entrenadores || res.data
          : []
      );
    } catch (error) {
      toast.error("Error al cargar entrenadores");
      setTrainers([]);
    }
  };

  const fetchStudents = async () =>
    apiRequest(
      "get",
      `/trainers/${user.id}/alumnos`,
      null,
      "Error al cargar alumnos"
    )
      .then(setStudents)
      .catch(() => {});

  const fetchStudentRoutines = async (studentId) => {
    try {
      const data = await apiRequest(
        "get",
        `/routine/user/${studentId}`,
        null,
        "Error al cargar rutinas del alumno"
      );
      setStudentRoutines(data.success ? data.routines : []);
      setViewRoutineStudent(studentId);
    } catch {
      setStudentRoutines([]);
    }
  };

  const handleSelectRoutine = async (routineId) =>
    apiRequest(
      "get",
      `/routine/${routineId}`,
      null,
      "Error al cargar detalle de rutina"
    )
      .then(setSelectedRoutine)
      .catch(() => {});

  const handleUpdateExercise = async (ejercicioId, series, repeticiones) => {
    try {
      await apiRequest(
        "put",
        `/routine/${selectedRoutine.id}/exercise/${ejercicioId}`,
        { series, repeticiones },
        "Error al actualizar ejercicio"
      );
      setSelectedRoutine({
        ...selectedRoutine,
        ejercicios: selectedRoutine.ejercicios.map((e) =>
          e.id === ejercicioId ? { ...e, series, repeticiones } : e
        ),
      });
      toast.success("Ejercicio actualizado");
    } catch {}
  };

  const handleDeleteExercise = async () => {
    try {
      await apiRequest(
        "delete",
        `/routine/${selectedRoutine.id}/exercise/${confirmModal.data}`,
        null,
        "Error al eliminar ejercicio"
      );
      setSelectedRoutine({
        ...selectedRoutine,
        ejercicios: selectedRoutine.ejercicios.filter(
          (e) => e.id !== confirmModal.data
        ),
      });
      toast.success("Ejercicio eliminado");
    } catch {
    } finally {
      setConfirmModal({ show: false, type: null, data: null });
    }
  };

  const handleUpdateRoutineName = async () => {
    try {
      await apiRequest(
        "put",
        `/routine/${selectedRoutine.id}/name`,
        { objetivo: editedName },
        "Error al actualizar nombre de la rutina"
      );
      setSelectedRoutine({ ...selectedRoutine, objetivo: editedName });
      setStudentRoutines(
        studentRoutines.map((r) =>
          r.id === selectedRoutine.id ? { ...r, objetivo: editedName } : r
        )
      );
      setIsEditingName(false);
      toast.success("Nombre actualizado");
    } catch (error) {
      console.error("Error al actualizar nombre:", error);
      toast.error(
        "No tienes permisos para modificar el nombre de esta rutina o la rutina no existe",
        { autoClose: 6000 }
      );
    }
  };

  const handleAddExercises = async (ejercicios) => {
    try {
      await apiRequest(
        "post",
        `/routine/${selectedRoutine.id}/exercises`,
        { ejercicios },
        "Error al agregar ejercicios"
      );
      const updatedRoutine = await apiRequest(
        "get",
        `/routine/${selectedRoutine.id}`,
        null,
        "Error al recargar rutina"
      );
      setSelectedRoutine(updatedRoutine);
      setStudentRoutines(
        studentRoutines.map((r) =>
          r.id === selectedRoutine.id
            ? { ...r, ejercicios: updatedRoutine.ejercicios }
            : r
        )
      );
      setShowAddExercises(false);
      toast.success("Ejercicios agregados");
    } catch {}
  };

  const handleAssign = async (trainerId) => {
    if (!user)
      return toast.error("Debes iniciar sesión para asignar un entrenador.");
    if (!window.confirm("¿Deseas asignarte este entrenador?")) return;

    try {
      await axios.put(`${API_URL}/trainers/${user.id}/asignar`, {
        id_trainer: trainerId,
      });
      setActiveTrainerId(trainerId);
      toast.success("Entrenador asignado correctamente");
      sessionStorage.setItem(
        "userData",
        JSON.stringify({
          ...JSON.parse(sessionStorage.getItem("userData")),
          userData: { ...user, id_trainer: trainerId },
        })
      );
    } catch {
      toast.error("Error al asignar entrenador");
    }
  };

  const renderTrainerTable = () => (
    <div className="mt-6 overflow-x-auto">
      {trainers.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No hay entrenadores disponibles para el turno seleccionado.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-orange-500 text-white">
            <tr>
              {["Nombre", "Apellido", "Email", "Cupos", "Turno", "Acción"].map(
                (h) => (
                  <th key={h} className="p-3 text-left">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {trainers.map((t) => (
              <tr
                key={t.id_entrenador}
                className={`transition-colors text-gray-900 dark:text-gray-100 ${
                  t.id_entrenador === activeTrainerId
                    ? "bg-green-100 dark:bg-green-900/30 font-semibold"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <td className="p-3">{t.nombre}</td>
                <td className="p-3">{t.apellido}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.cupos}</td>
                <td className="p-3">{t.turno}</td>
                <td className="p-3 text-center">
                  {t.id_entrenador === activeTrainerId ? (
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      Asignado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssign(t.id_entrenador)}
                      className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition-all shadow-md"
                    >
                      Asignar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderStudentsTable = () => (
    <div className="mt-6 overflow-x-auto min-h-[80px]">
      {students.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tienes alumnos asignados aún.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-orange-500 text-white">
            <tr>
              {["Nombre", "Apellido", "Email"].map((h) => (
                <th key={h} className="p-3 text-left">
                  {h}
                </th>
              ))}
              <th key="Rutina" colSpan={2} className="p-3 text-center">
                Rutina
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700">
            {students.map((s) => (
              <tr
                key={s.id}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="p-3">{s.nombre}</td>
                <td className="p-3">{s.apellido}</td>
                <td className="p-3">{s.email}</td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => setSelectedStudent(s.id)}
                      className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded-lg transition-all shadow-md"
                    >
                      Asignar rutina
                    </button>
                    <button
                      onClick={() => fetchStudentRoutines(s.id)}
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all shadow-md"
                    >
                      Ver rutina
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedStudent && (
        <CreateRoutineModal
          studentId={selectedStudent}
          trainerId={user.id}
          onClose={() => setSelectedStudent(null)}
        />
      )}

      {viewRoutineStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-4 ">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-11/12 max-w-6xl p-6 max-h-[95vh] overflow-y-auto my-auto">
            {!selectedRoutine ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-orange-500">
                    Rutinas del Alumno
                  </h2>
                  <button
                    onClick={() => {
                      setViewRoutineStudent(null);
                      setStudentRoutines([]);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cerrar
                  </button>
                </div>
                {studentRoutines.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentRoutines.map((r) => (
                      <div
                        key={r.id}
                        onClick={() => handleSelectRoutine(r.id)}
                        className="border border-gray-300 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition cursor-pointer hover:border-orange-500"
                      >
                        <h3 className="text-xl font-bold text-orange-500 mb-2">
                          {r.objetivo}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          <strong>Fecha:</strong>{" "}
                          {new Date(r.fecha).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                          {r.ejercicios?.length || 0} Ejercicios
                        </p>
                        {r.ejercicios && r.ejercicios.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {r.ejercicios.slice(0, 3).map((ej, idx) => (
                              <p
                                key={idx}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                • {ej.nombre}
                              </p>
                            ))}
                            {r.ejercicios.length > 3 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ...y {r.ejercicios.length - 3} más
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400">
                    Este alumno no tiene rutinas asignadas.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setSelectedRoutine(null)}
                    className="inline-flex items-center gap-2 text-white bg-orange-500 font-medium px-3 py-2 rounded-lg hover:bg-orange-400"
                  >
                    <span>←</span> Volver a rutinas
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoutine(null);
                      setViewRoutineStudent(null);
                      setStudentRoutines([]);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Cerrar
                  </button>
                </div>
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
                        className="flex-1 text-2xl font-semibold text-orange-600 dark:text-orange-500 dark:bg-gray-800 border-2 border-orange-500 rounded px-2 py-1"
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
                      <h3 className="text-2xl font-semibold text-orange-600 dark:text-orange-500">
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
                      <button
                        onClick={() => setShowAddExercises(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm"
                      >
                        Agregar ejercicios
                      </button>
                    </>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  <strong>Fecha:</strong>{" "}
                  {new Date(selectedRoutine.fecha).toLocaleDateString()}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedRoutine.ejercicios?.length > 0 ? (
                    selectedRoutine.ejercicios
                      .slice()
                      .sort((a, b) => (a.orden ?? a.id) - (b.orden ?? b.id))
                      .map((e, index) => (
                        <RoutineCard
                          key={e.id}
                          ejercicio={e}
                          index={index}
                          onUpdate={handleUpdateExercise}
                          onDelete={(ejercicioId) =>
                            setConfirmModal({
                              show: true,
                              type: "exercise",
                              data: ejercicioId,
                            })
                          }
                        />
                      ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay ejercicios asignados.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.show && confirmModal.type === "exercise"}
        title="Eliminar ejercicio"
        message="¿Seguro que deseas eliminar este ejercicio de la rutina?"
        onCancel={() =>
          setConfirmModal({ show: false, type: null, data: null })
        }
        onConfirm={handleDeleteExercise}
      />
      {showAddExercises && selectedRoutine && (
        <AddExercisesModal
          onClose={() => setShowAddExercises(false)}
          onSubmit={handleAddExercises}
          existingExercises={selectedRoutine.ejercicios || []}
        />
      )}
    </div>
  );

  if (loadingMembership)
    return <p className="text-center">Verificando membresía...</p>;

  if (!membership?.membershipActive) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Membresía inactiva</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener una membresía activa para acceder a esta sección.
        </p>
        <button
          onClick={() => (window.location.href = "/membership")}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Ir a membresía
        </button>
      </div>
    );
  }

  const cardClass =
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-8 animate-fadeInUp";

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 py-12">
        {!user && (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            Cargando...
          </p>
        )}

        {user?.id_rol === 2 && (
          <div className={cardClass}>
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded-lg mb-4"
              onClick={() => (window.location.href = "/profile")}
            >
              ← Volver al Perfil
            </button>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-orange-500 pb-3">
              Lista de Entrenadores
            </h2>
            {renderTrainerTable()}
          </div>
        )}

        {user?.id_rol === 3 && (
          <div className={cardClass}>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-orange-500 pb-3">
              Lista de Alumnos
            </h2>
            {renderStudentsTable()}
          </div>
        )}

        {user && ![2, 3].includes(user.id_rol) && (
          <p className="text-center mt-12 text-gray-500 dark:text-gray-400 text-lg">
            Esta sección no está disponible para tu rol.
          </p>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-300 text-center py-4 border-t border-gray-700">
        <p className="text-sm">
          © 2025 NukeGym. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
