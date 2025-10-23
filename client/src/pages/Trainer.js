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

  useEffect(
    () => {
      if (!user) return;

      if (user.id_rol === 2) {
        fetchTrainers();
        setActiveTrainerId(user.id_trainer);
      } else if (user.id_rol === 3) {
        fetchStudents();
      }
    },
    [
      /* user */
    ]
  );

  const fetchTrainers = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/trainers");
      setTrainers(res.data);
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
    <div className="container mx-auto mt-10 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Entrenadores Disponibles
      </h2>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead className="bg-orange-500 text-white">
          <tr>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Apellido</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Acción</th>
          </tr>
        </thead>
        <tbody>
          {trainers.map((t) => (
            <tr
              key={t.id_entrenador}
              className={`${
                t.id_entrenador === activeTrainerId
                  ? "bg-green-100 font-semibold"
                  : ""
              }`}
            >
              <td className="border p-2">{t.nombre}</td>
              <td className="border p-2">{t.apellido}</td>
              <td className="border p-2">{t.email}</td>
              <td className="border p-2 text-center">
                {t.id === activeTrainerId ? (
                  <span className="text-green-600 font-bold">Asignado</span>
                ) : (
                  <button
                    onClick={() => handleAssign(t.id_entrenador)}
                    className="bg-purple-500 hover:bg-purple-800 text-white px-3 py-1 rounded"
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
    <div className="container mx-auto mt-10 flex-grow">
      <h2 className="text-2xl font-bold mb-6 text-center">Alumnos Asignados</h2>

      {students.length === 0 ? (
        <p className="text-center text-gray-500">
          No tienes alumnos asignados aún.
        </p>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="border p-2">Nombre</th>
              <th className="border p-2">Apellido</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Rutina</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="border p-2">{s.nombre}</td>
                <td className="border p-2">{s.apellido}</td>
                <td className="border p-2">{s.email}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => setSelectedStudent(s.id)}
                    className="bg-purple-500 hover:bg-purple-800 text-white px-3 py-1 rounded"
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
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        {!user && <p className="text-center mt-10">Cargando...</p>}
        {user?.id_rol === 2 && renderTrainerTable()}
        {user?.id_rol === 3 && renderStudentsTable()}
        {user && ![2, 3].includes(user.id_rol) && (
          <p className="text-center mt-10 text-gray-500">
            Esta sección no está disponible para tu rol.
          </p>
        )}
      </div>

      <footer className="bg-gray-800 text-white text-center py-4 mt-8">
        <p className="text-sm">
          © 2025 NukeGym. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
