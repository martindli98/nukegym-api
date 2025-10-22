import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import NotificationCard from "../components/Notification/NotificationCard";
import NotificationForm from "../components/Notification/NotificationForm";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [formData, setFormData] = useState({
    titulo: "",
    mensaje: "",
    fecha_envio: "",
  });
  const user =
    JSON.parse(sessionStorage.getItem("userData"))?.userData ||
    JSON.parse(sessionStorage.getItem("userData"));

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const res = await fetch("http://localhost:3000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
      setError(null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError(error.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Función para manejar edición de notificación
  const handleEditNotification = (notification) => {
    const notifDate = new Date(notification.fecha);
    const formattedDate = notifDate.toISOString().slice(0, 16);

    setFormData({
      titulo: notification.titulo,
      mensaje: notification.mensaje,
      fecha_envio: formattedDate,
    });
    setEditingNotification(notification);
    setShowForm(true);
  };

  // Función para manejar eliminación de notificación
  const handleDeleteNotification = async (id) => {
    if (
      !window.confirm("¿Estás seguro de que deseas cancelar esta notificación?")
    ) {
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const res = await fetch(`http://localhost:3000/api/notifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al eliminar la notificación");
      }

      toast.success("Notificación cancelada exitosamente");
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(error.message || "Error al cancelar la notificación");
    }
  };

  const createNotification = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      // Validar que la fecha no sea anterior a la actual
      if (formData.fecha_envio) {
        const fechaSeleccionada = new Date(formData.fecha_envio);
        const fechaActual = new Date();

        if (fechaSeleccionada < fechaActual) {
          toast.error("No puedes programar una notificación en el pasado");
          return;
        }
      }

      // Validar longitud del título
      if (formData.titulo.length > 100) {
        toast.error("El título no puede exceder los 100 caracteres");
        return;
      }

      // Validar longitud del mensaje
      if (formData.mensaje.length > 255) {
        toast.error("El mensaje no puede exceder los 255 caracteres");
        return;
      }

      const url = editingNotification
        ? `http://localhost:3000/api/notifications/${editingNotification.id}`
        : "http://localhost:3000/api/notifications";

      const method = editingNotification ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          titulo: formData.titulo.trim(),
          mensaje: formData.mensaje.trim(),
          fecha_envio: formData.fecha_envio || new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al guardar la notificación");
      }

      toast.success(
        editingNotification
          ? "Notificación actualizada correctamente"
          : "Notificación creada correctamente"
      );
      setShowForm(false);
      setFormData({ titulo: "", mensaje: "", fecha_envio: "" });
      setEditingNotification(null);
      await fetchNotifications();
    } catch (error) {
      console.error("Error creating/updating notification:", error);
      toast.error(error.message || "Error al guardar la notificación");
    }
  };

  const isAdmin = user?.id_rol === 1;
  const isClientOrTrainer = user?.id_rol === 2 || user?.id_rol === 3;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {isAdmin ? "Panel de Notificaciones" : "Mis Notificaciones"}
        </h1>

        {isClientOrTrainer && (
          <div
            className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6"
            role="alert"
          >
            <p className="font-bold">📬 Notificaciones del Gimnasio</p>
            <p className="text-sm">
              Aquí encontrarás todos los anuncios e información importante.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4">
            <p className="text-gray-600">Cargando notificaciones...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {isAdmin && (
              <button
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) {
                    setEditingNotification(null);
                    setFormData({ titulo: "", mensaje: "", fecha_envio: "" });
                  }
                }}
                className="mb-4 bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
              >
                {showForm
                  ? "Cancelar"
                  : editingNotification
                  ? "Cancelar Edición"
                  : "Nueva Notificación"}
              </button>
            )}

            {showForm && isAdmin && (
              <>
                <h3 className="text-xl font-semibold mb-4">
                  {editingNotification
                    ? "Editar Notificación"
                    : "Nueva Notificación"}
                </h3>
                <NotificationForm
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={createNotification}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingNotification(null);
                    setFormData({ titulo: "", mensaje: "", fecha_envio: "" });
                  }}
                  isEditing={!!editingNotification}
                />
              </>
            )}

            <div className="space-y-4">
              {notifications && notifications.length > 0 ? (
                notifications.map((notif) => (
                  <NotificationCard
                    key={notif.id}
                    notification={notif}
                    onEdit={handleEditNotification}
                    onDelete={handleDeleteNotification}
                  />
                ))
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                  <p className="text-gray-500 text-lg">
                    {isClientOrTrainer
                      ? "No tienes notificaciones en este momento"
                      : "No hay notificaciones disponibles"}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    {isClientOrTrainer &&
                      "Aquí aparecerán los anuncios importantes del gimnasio"}
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;
