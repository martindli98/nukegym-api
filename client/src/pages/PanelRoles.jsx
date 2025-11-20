import { useEffect, useState } from "react";
import axios from "axios";

export default function PanelRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const [trainerData, setTrainerData] = useState({});
  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://localhost:3000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data))
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

  const cambiarRol = async (id, id_rol) => {
    try {
      await axios.put(
        `http://localhost:3000/api/roles/${id}`,
        { id_rol: Number(id_rol) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsuarios((prev) =>
        prev.map((u) => (u.id === id ? { ...u, id_rol: Number(id_rol) } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Error al actualizar rol");
    }
  };

  const actualizarTrainer = async (id_usuario, campo, valor) => {
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
      console.error(err);
      alert("Error al actualizar entrenador");
    }
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-800  py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-orange-500">
          Panel de Roles
        </h2>

        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4 ">Nombre</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rol</th>
              <th className="py-3 px-4">Cambiar Rol</th>
              <th className="py-3 px-4">Turno</th>
              <th className="py-3 px-4">Cupos</th>
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
                              : "text-black bg-gray-50 dark:text-gray-300 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                >
                  <td className="py-3 px-4">{u.nombre}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4 font-semibold">
                    {getRolNombre(u.id_rol)}
                  </td>

                  <td className="py-3 px-4">
                    <select
                      value={u.id_rol}
                      onChange={(e) => cambiarRol(u.id, e.target.value)}
                      className="bg-white dark:bg-gray-700 rounded-lg px-2 py-1"
                    >
                      <option value={1}>Admin</option>
                      <option value={2}>Cliente</option>
                      <option value={3}>Entrenador</option>
                    </select>
                  </td>
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
