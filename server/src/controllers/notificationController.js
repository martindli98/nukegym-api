import { pool } from "../config/db.js";

// Función helper para validaciones comunes
const validateNotificationData = (titulo, mensaje, fecha_envio) => {
  const errors = [];

  if (!titulo || !mensaje) {
    errors.push("Título y mensaje son requeridos");
  }

  if (titulo && titulo.length > 100) {
    errors.push("El título no puede exceder los 100 caracteres");
  }

  if (mensaje && mensaje.length > 255) {
    errors.push("El mensaje no puede exceder los 255 caracteres");
  }

  const fecha = fecha_envio ? new Date(fecha_envio) : new Date();
  const fechaActual = new Date();

  if (fecha < fechaActual) {
    errors.push("No se puede programar una notificación en el pasado");
  }

  return { errors, fecha };
};

// Función helper para verificar permisos de admin
const checkAdminPermission = (req, res) => {
  if (req.user.id_rol === 1) {
    res.status(403).json({
      message: "No tienes permiso de administrador",
    });
    return false;
  }
  return true;
};

// Función helper para verificar permisos y propiedad
const checkNotificationOwnership = async (notificationId, userId) => {
  const [notification] = await pool.query(
    "SELECT * FROM Notificacion WHERE id = ? AND id_usuario = ?",
    [notificationId, userId]
  );

  return notification.length > 0 ? notification[0] : null;
};

export const createNotification = async (req, res) => {
  try {
    const { titulo, mensaje, fecha_envio } = req.body;
    const id_usuario = req.user.id;

    // Verificar permisos (solo admin puede crear notificaciones)
    if (!checkAdminPermission(req, res)) return;

    // Validar datos
    const { errors, fecha } = validateNotificationData(
      titulo,
      mensaje,
      fecha_envio
    );

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    await pool.query(
      "INSERT INTO Notificacion (titulo, mensaje, id_usuario, fecha) VALUES (?, ?, ?, ?)",
      [titulo, mensaje, id_usuario, fecha]
    );

    res.json({ message: "Notificación creada exitosamente" });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { id, id_rol } = req.user;

    let notifications;

    // Si es admin (id_rol === 1), puede ver las notificaciones que él creó
    if (id_rol === 1) {
      [notifications] = await pool.query(
        "SELECT * FROM Notificacion WHERE id_usuario = ? ORDER BY fecha DESC",
        [id]
      );
    } else {
      // Si es cliente o entrenador, ve todas las notificaciones
      [notifications] = await pool.query(
        "SELECT * FROM Notificacion ORDER BY fecha DESC"
      );
    }

    // Asegurarse de que siempre devolvemos un array
    res.json(Array.isArray(notifications) ? notifications : []);
  } catch (error) {
    console.error("Error getting notifications:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, mensaje, fecha_envio } = req.body;
    const id_usuario = req.user.id;

    // Verificar permisos (solo admin puede editar)
    if (!checkAdminPermission(req, res)) return;

    // Verificar que la notificación existe y pertenece al usuario
    const notification = await checkNotificationOwnership(id, id_usuario);

    if (!notification) {
      return res.status(404).json({
        message:
          "Notificación no encontrada o no tienes permisos para editarla",
      });
    }

    // Verificar que la notificación no haya sido enviada aún
    const notifDate = new Date(notification.fecha);
    const currentDate = new Date();

    if (notifDate <= currentDate) {
      return res.status(400).json({
        message: "No se puede editar una notificación que ya fue enviada",
      });
    }

    // Validar datos
    const { errors, fecha } = validateNotificationData(
      titulo,
      mensaje,
      fecha_envio || notification.fecha
    );

    if (errors.length > 0) {
      return res.status(400).json({ message: errors[0] });
    }

    // Actualizar la notificación
    await pool.query(
      "UPDATE Notificacion SET titulo = ?, mensaje = ?, fecha = ? WHERE id = ?",
      [titulo, mensaje, fecha, id]
    );

    res.json({ message: "Notificación actualizada exitosamente" });
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const id_usuario = req.user.id;

    // Verificar permisos (solo admin puede eliminar)
    if (!checkAdminPermission(req, res)) return;

    // Verificar que la notificación existe y pertenece al admin
    const notification = await checkNotificationOwnership(id, id_usuario);

    if (!notification) {
      return res.status(404).json({
        message:
          "Notificación no encontrada o no tienes permisos para eliminarla",
      });
    }

    // Verificar que la notificación no haya sido enviada aún
    const notifDate = new Date(notification.fecha);
    const currentDate = new Date();

    if (notifDate <= currentDate) {
      return res.status(400).json({
        message: "No se puede eliminar una notificación que ya fue enviada",
      });
    }

    // Eliminar la notificación
    await pool.query("DELETE FROM Notificacion WHERE id = ?", [id]);

    res.json({ message: "Notificación eliminada exitosamente" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: error.message });
  }
};
