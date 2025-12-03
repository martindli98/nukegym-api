import { useEffect, useState } from "react";
import axios from "axios";
import ConfirmModal from "../components/confirmModal/confirmModal.jsx";
import { toast } from "react-toastify";

export default function PanelRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const [trainerData, setTrainerData] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRol, setSelectedRol] = useState(null);
  const [confirmData, setConfirmData] = useState(null);

  const token = sessionStorage.getItem("authToken");

  const stored = sessionStorage.getItem("userData");
  const loggedUserId = stored ? JSON.parse(stored).userData?.id : null;

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:3000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const mapped = res.data.map((u) => ({
          ...u,
          membresia: u.membresia_tipo
            ? { tipo: u.membresia_tipo, estado: u.membresia_estado }
            : null,
        }));

        setUsuarios(mapped);
      })
      .catch((err) => console.error(err));
  }, [token]);

  useEffect(() => {
    axios
      .get("http://localhost:3000/api/trainers")
      .then((res) => {
        const map = {};
        res.data.forEach((t) => {
          map[t.id_usuario] = t;
        });
        setTrainerData(map);
      })
      .catch((err) => console.error("Error cargando entrenadores:", err));
  }, []);

  const handleRolChange = (user, newRol) => {
    if (Number(user.id) === Number(loggedUserId)) {
      toast.error("No podés cambiar tu propio rol.");
      return;
    }

    abrirConfirmacion(
      "Confirmar cambio de rol",
      `¿Seguro que deseas cambiar el rol de ${user.nombre}?`,
      () => confirmarCambioRol(user, newRol)
    );
  };

  const confirmarCambioRol = async (user, newRol) => {
    try {
      await axios.put(
        `http://localhost:3000/api/roles/${Number(user.id)}`,
        { id_rol: Number(newRol) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsuarios((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, id_rol: newRol } : u))
      );

      toast.success("Rol actualizado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("Error actualizando rol");
    }

    setConfirmData(null);
  };

  const actualizarTrainer = (id_usuario, campo, valor) => {
    abrirConfirmacion(
      "Confirmar cambio",
      `¿Seguro que deseas cambiar el ${campo} del entrenador?`,
      async () => {
        const actual = trainerData[id_usuario] || {};

        const newData = {
          turno: campo === "turno" ? valor : actual.turno,
          cupos: campo === "cupos" ? Number(valor) : actual.cupos,
        };

        try {
          await axios.put(
            `http://localhost:3000/api/trainers/${id_usuario}/update`,
            newData,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setTrainerData((prev) => ({
            ...prev,
            [id_usuario]: { ...prev[id_usuario], ...newData },
          }));
        } catch (err) {
          console.error("Error al actualizar:", err);
        }

        setConfirmData(null);
      }
    );
  };

  const getMembresiaNombre = (tipo) => {
    const t = String(tipo)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    // Esto elimina tildes y normaliza todo

    if (t === "1" || t === "basico") return "Básico";
    if (t === "2" || t === "medio") return "Medio";
    if (t === "3" || t === "libre") return "Libre";

    return "Desconocido";
  };

  const asignarMembresia = (userId, tipo) => {
    abrirConfirmacion(
      "Asignar membresía",
      `¿Seguro que deseas asignar el plan ${tipo.toUpperCase()} a este usuario?`,
      async () => {
        try {
          await axios.post(
            "http://localhost:3000/api/membership/assign",
            { userId, tipo },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Membresía asignada");

          setUsuarios((prev) =>
            prev.map((u) =>
              u.id === userId
                ? {
                    ...u,
                    membresia: {
                      tipo,
                      estado: "activo",
                    },
                  }
                : u
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Error asignando membresía");
        }

        setConfirmData(null);
      }
    );
  };

  const darDeBaja = (userId) => {
    abrirConfirmacion(
      "Dar de baja",
      "¿Estás seguro que deseas dar de baja esta membresía?",
      async () => {
        try {
          await axios.put(
            "http://localhost:3000/api/membership/deactivate",
            { userId },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          toast.success("Membresía dada de baja");

          setUsuarios((prev) =>
            prev.map((u) =>
              u.id === userId
                ? { ...u, membresia: { ...u.membresia, estado: "inactivo" } }
                : u
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Error al dar de baja");
        }

        setConfirmData(null);
      }
    );
  };

  const getRolNombre = (id_rol) => {
    switch (id_rol) {
      case 1:
        return "Admin";
      case 2:
        return "Cliente";
      case 3:
        return "Entrenador";
      default:
        return "Desconocido";
    }
  };

  const abrirConfirmacion = (title, message, onConfirm) => {
    setConfirmData({ title, message, onConfirm });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800 py-10 px-6 transform -translate-y-10 animate-fadeInUp">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">
          Panel de Roles
        </h2>

        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Cambiar Rol</th>
              <th className="py-3 px-4">Turno</th>
              <th className="py-3 px-4">Cupos</th>
              <th className="py-3 px-4">Membresía</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {usuarios.map((u, index) => {
              const trainer = trainerData[u.id];

              return (
                <tr
                  key={u.id}
                  className={`${
                    index % 2 === 0
                      ? "text-black bg-gray-50 dark:text-gray-300 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
                      : "text-black bg-white dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <td className="py-3 px-4">{u.nombre}</td>
                  <td className="py-3 px-4">{u.email}</td>

                  <td className="py-3 px-4 font-semibold">
                    {getRolNombre(u.id_rol)}
                  </td>

                  {/* Selección de rol */}
                  <td className="py-3 px-4">
                    <select
                      value={u.id_rol}
                      disabled={Number(u.id) === Number(loggedUserId)}
                      onChange={(e) =>
                        handleRolChange(u, Number(e.target.value))
                      }
                      className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1"
                    >
                      <option value={1}>Admin</option>
                      <option value={2}>Cliente</option>
                      <option value={3}>Entrenador</option>
                    </select>
                  </td>

                  {/* Turno */}
                  <td className="py-3 px-4">
                    {u.id_rol === 3 ? (
                      <select
                        value={trainer?.turno || "Mañana"}
                        onChange={(e) =>
                          actualizarTrainer(u.id, "turno", e.target.value)
                        }
                        className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1"
                      >
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noche">Noche</option>
                      </select>
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Cupos */}
                  <td className="py-3 px-4">
                    {u.id_rol === 3 ? (
                      <input
                        type="number"
                        className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1 w-20"
                        value={trainer?.cupos ?? 0}
                        onChange={(e) =>
                          actualizarTrainer(u.id, "cupos", e.target.value)
                        }
                      />
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Membresía */}
                  <td className="py-3 px-4">
                    {u.id_rol === 2 ? (
                      u.membresia ? (
                        <span
                          className={
                            u.membresia.estado === "activo"
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {getMembresiaNombre(u.membresia.tipo)} (
                          {u.membresia.estado})
                        </span>
                      ) : (
                        <span className="text-red-500 font-semibold">
                          Sin membresía
                        </span>
                      )
                    ) : (
                      "-"
                    )}
                  </td>

                  {/* Acciones de membresía */}
                  <td className="py-3 px-4">
                    {u.id_rol === 2 && (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) =>
                            asignarMembresia(u.id, e.target.value)
                          }
                          className="bg-white dark:bg-gray-700 rounded px-2 py-1"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Elegir plan
                          </option>
                          <option value="basico">Básico</option>
                          <option value="medio">Medio</option>
                          <option value="libre">Libre</option>
                        </select>

                        {u.membresia && (
                          <button
                            onClick={() => darDeBaja(u.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Baja
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Confirmación */}
      {confirmData && (
        <ConfirmModal
          isOpen={true}
          title={confirmData.title}
          message={confirmData.message}
          onConfirm={confirmData.onConfirm}
          onCancel={() => setConfirmData(null)}
        />
      )}
    </div>
  );
}
