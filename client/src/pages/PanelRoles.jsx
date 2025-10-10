import { useEffect, useState } from "react";
import axios from "axios";

export default function PanelRoles() {
  const [usuarios, setUsuarios] = useState([]);
  const token = sessionStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:3000/api/roles", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsuarios(res.data))
      .catch((err) => {
        console.error(err);
        alert(err.response?.data?.mensaje || "Error al obtener usuarios");
      });
  }, [token]);

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
      alert(err.response?.data?.mensaje || "Error al actualizar rol");
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
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-600">
          Panel de Roles
        </h2>

        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-orange-500 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Nombre</th>
              <th className="py-3 px-4 text-left">Email</th>
              <th className="py-3 px-4 text-left">Rol Actual</th>
              <th className="py-3 px-4 text-left">Cambiar Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u, index) => (
              <tr
                key={u.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-gray-100 transition`}
              >
                <td className="py-3 px-4">{u.nombre || "-"}</td>
                <td className="py-3 px-4">{u.email}</td>
                <td className="py-3 px-4 font-semibold text-gray-700">
                  {getRolNombre(u.id_rol)}
                </td>
                <td className="py-3 px-4">
                  <select
                    value={u.id_rol}
                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    <option value={1}>Admin</option>
                    <option value={2}>Cliente</option>
                    <option value={3}>Entrenador</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
