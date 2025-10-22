import { useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";

const useNotifications = (userData) => {
  const lastCheckRef = useRef(new Date());
  const shownNotificationsRef = useRef(new Set());

  const checkNewNotifications = useCallback(async () => {
    // Solo verificar si el usuario es cliente (id_rol === 2) o entrenador (id_rol === 3)
    if (!userData || (userData.id_rol !== 2 && userData.id_rol !== 3)) {
      return;
    }

    try {
      const token = sessionStorage.getItem("authToken");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return;

      const notifications = await res.json();
      const now = new Date();

      // Filtrar notificaciones que deben mostrarse ahora
      notifications.forEach((notif) => {
        const notifDate = new Date(notif.fecha);
        const notifId = notif.id;

        // Verificar si la notificación debe mostrarse
        // y no se ha mostrado antes
        if (
          notifDate <= now &&
          notifDate > lastCheckRef.current &&
          !shownNotificationsRef.current.has(notifId)
        ) {
          // Mostrar toast con la notificación
          toast.info(
            <div>
              <strong>{notif.titulo}</strong>
              <p className="text-sm mt-1">{notif.mensaje}</p>
            </div>,
            {
              position: "top-right",
              autoClose: 15000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );

          // Marcar como mostrada
          shownNotificationsRef.current.add(notifId);
        }
      });

      lastCheckRef.current = now;
    } catch (error) {
      console.error("Error checking notifications:", error);
    }
  }, [userData]);

  useEffect(() => {
    if (!userData || (userData.id_rol !== 2 && userData.id_rol !== 3)) {
      return;
    }

    // Verificar inmediatamente
    checkNewNotifications();

    // Verificar cada 30 segundos
    const interval = setInterval(checkNewNotifications, 30000);

    return () => clearInterval(interval);
  }, [userData, checkNewNotifications]);
};

export default useNotifications;
