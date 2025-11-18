import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import CreateRoutineModal from "../components/Routine/CreateRoutineModal";

export default function Trainer() {
  const userSession = JSON.parse(sessionStorage.getItem("userData"));
  const user = userSession?.userData || userSession;

  const [trainers, setTrainers] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTrainerId, setActiveTrainerId] = useState(null);

  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    if (!user) return;

    if (user.id_rol === 2) {
      fetchTrainers();
      setActiveTrainerId(user.id_trainer);
    } else if (user.id_rol === 3) {
      fetchStudents();
    }
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/trainers");
      setTrainers(res.data);
      console.log(res.data);
    } catch (error) {
      toast.error("Error al cargar entrenadores");
      console.error(error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/trainers/${user.id}/alumnos`
      );
      setStudents(res.data);
    } catch (error) {
      toast.error("Error al cargar alumnos");
      console.error(error);
    }
  };

  const handleAssign = async (trainerId) => {
    if (!user) {
      toast.error("Debes iniciar sesión para asignar un entrenador.");
      return;
    }

    const confirm = window.confirm("¿Deseas asignar este entrenador?");
    if (!confirm) return;

    try {
      await axios.put(`http://localhost:3000/api/trainers/${user.id}/asignar`, {
        id_trainer: trainerId,
      });

      setActiveTrainerId(trainerId);
      toast.success("Entrenador asignado correctamente");

      const updatedUser = { ...user, id_trainer: trainerId };
      sessionStorage.setItem(
        "userData",
        JSON.stringify({ ...userSession, userData: updatedUser })
      );
    } catch (error) {
      toast.error("Error al asignar entrenador");
      console.error(error);
    }
  };

  const renderTrainerTable = () => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse">
        <thead className="bg-orange-500 text-white">
          <tr>
            <th className="p-3 text-left">Nombre</th>
            <th className="p-3 text-left">Apellido</th>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Cupos</th>
            <th className="p-3 text-left">Turno</th>
            <th className="p-3 text-center">Acción</th>
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
                    className="
                    bg-purple-600 hover:bg-purple-800 
                    text-white px-4 py-2 rounded-lg 
                    transition-all shadow-md
                  "
                  >
                    Asignar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderStudentsTable = () => (
    <div className="mt-6 overflow-x-auto">
      {students.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No tienes alumnos asignados aún.
        </p>
      ) : (
        <table className="w-full border-collapse">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="p-3 text-left">Nombre</th>
              <th className="p-3 text-left">Apellido</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-center">Rutina</th>
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
                  <button
                    onClick={() => setSelectedStudent(s.id)}
                    className="
                    bg-purple-600 hover:bg-purple-800 
                    text-white px-4 py-2 rounded-lg 
                    transition-all shadow-md
                  "
                  >
                    Asignar rutina
                  </button>
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col transition-colors duration-300">
      {/* CONTENIDO */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-10">
        {/* LOADING */}
        {!user && (
          <p className="text-center text-gray-600 dark:text-gray-300 text-lg">
            Cargando...
          </p>
        )}

        {/* ENTRENADORES */}
        {user?.id_rol === 2 && (
          <div
            className="
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700 
            rounded-2xl shadow-lg p-8
          "
          >
            {" "}
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

        {/* ALUMNOS */}
        {user?.id_rol === 3 && (
          <div
            className="
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700 
            rounded-2xl shadow-lg p-8
          "
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b border-orange-500 pb-3">
              Lista de Alumnos
            </h2>

            {renderStudentsTable()}
          </div>
        )}

        {/* SIN PERMISOS */}
        {user && ![2, 3].includes(user.id_rol) && (
          <p className="text-center mt-12 text-gray-500 dark:text-gray-400 text-lg">
            Esta sección no está disponible para tu rol.
          </p>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 text-center py-4 border-t border-gray-700">
        <p className="text-sm">
          © 2025 NukeGym. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
