import React, { useState, useEffect } from "react";

const NotificationCard = ({ notification, onEdit, onDelete }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Obtener datos del usuario
  const user =
    JSON.parse(sessionStorage.getItem("userData"))?.userData ||
    JSON.parse(sessionStorage.getItem("userData"));

  const isAdmin = user?.id_rol === 1;
  const isClientOrTrainer = user?.id_rol === 2 || user?.id_rol === 3;

  // Actualizar el tiempo actual cada segundo para verificar si sigue siendo programada
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const notifDate = new Date(notification.fecha);
  const isProgrammed = notifDate > currentTime;

  // Si es cliente o entrenador y la notificación está programada, no mostrar la card
  if (isClientOrTrainer && isProgrammed) {
    return null;
  }

  // Determinar si el título o mensaje son largos
  const isLongTitle = notification.titulo.length > 50;
  const isLongMessage = notification.mensaje.length > 150;

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-5 mb-4 border-l-4 transition-all duration-300 hover:shadow-lg ${
        isProgrammed ? "border-yellow-500" : "border-blue-500"
      }`}
    >
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0 mt-1">
              {isProgrammed ? "⏰" : "📢"}
            </span>
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-gray-800 break-words ${
                  isLongTitle ? "text-base" : "text-lg"
                }`}
              >
                {notification.titulo}
              </h3>
              <p
                className={`text-gray-600 mt-2 break-words whitespace-pre-wrap ${
                  isLongMessage ? "text-sm" : "text-base"
                }`}
              >
                {notification.mensaje}
              </p>
              {isProgrammed && isAdmin && (
                <span className="inline-block mt-3 text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-medium">
                  ⏰ Programada para:{" "}
                  {notifDate.toLocaleString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {!isProgrammed && (
                <span className="inline-block mt-3 text-xs bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full font-medium">
                  📢 {isAdmin ? "Enviada" : "Recibida"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="text-right flex-shrink-0 md:ml-4">
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <small className="text-gray-700 font-medium block">
              {notifDate.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </small>
            <small className="text-gray-500 block mt-1">
              {notifDate.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </small>
          </div>

          {/* Botones de editar y eliminar (solo para admin y programadas) */}
          {isAdmin && isProgrammed && onEdit && onDelete && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(notification)}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Editar notificación"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Editar
              </button>
              <button
                onClick={() => onDelete(notification.id)}
                className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                title="Cancelar notificación"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
