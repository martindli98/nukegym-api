import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

function MembershipType({
  planId,
  title,
  img,
  descripcion,
  color = "purple",
  precio,
  isAdmin = false,
  onUpdate,
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: title,
    descripcion,
    precio,
  });

  const colorClasses = {
    purple: "from-purple-500 to-purple-700",
    blue: "from-blue-500 to-blue-700",
    yellow: "from-yellow-500 to-yellow-700",
    red: "from-red-500 to-red-700",
    green: "from-green-500 to-green-700",
  };

  const handleUpdate = async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3000/api/membership/plans/${planId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Plan actualizado correctamente");
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      toast.error("Error al actualizar el plan");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl shadow-xl p-8 flex flex-col items-center text-center gap-4 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {img && (
        <div className="rounded-2xl flex items-center justify-center bg-gradient-to-br text-white shadow-lg">
          <img src={img} alt={title} className="w-full h-full object-contain" />
        </div>
      )}

      {isEditing ? (
        <>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre del plan"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <textarea
            type="text"
            name="descripcion"
            placeholder="Descripción del plan"
            value={formData.descripcion}
            onChange={(e) =>
              setFormData({ ...formData, descripcion: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
            rows={3}
          />
          <input
            
            type="number"
            name="precio"
            placeholder="Precio del plan"
            min={0}
            value={formData.precio}
            onChange={(e) =>
              setFormData({ ...formData, precio: e.target.value })
            }
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:text-white"
          />
          <div className="flex gap-2 w-full">
            <button
              onClick={handleUpdate}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Guardar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cancelar
            </button>
          </div>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
            {descripcion}
          </p>
          <button
            className={`mt-4 w-full py-2 rounded-xl font-semibold text-white bg-gradient-to-r ${colorClasses[color]} hover:opacity-90 transition-all duration-200`}
          >
            ${precio}
          </button>
          {isAdmin && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 mt-2"
            >
              Editar
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default MembershipType;
