import React from "react";

const ClassCard = ({
  classItem,
  isClient,
  userReservations,
  onReserve,
  onCancelReservation,
  onEdit,
  onDelete,
  formatDate,
}) => {
  // Para clientes: mostrar botón de reservar/cancelar
  if (isClient) {
    const reserva = userReservations?.find(
      (r) => r.id_clase === classItem.id_clase && r.estado === "reservado"
    );
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {classItem.nombre}
          </h3>
          {classItem.descripcion && (
            <p className="text-gray-600 text-sm">{classItem.descripcion}</p>
          )}
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {formatDate(classItem.horario)}
          </div>
          {classItem.entrenador_nombre && (
            <div className="flex items-center text-sm text-gray-700">
              <svg
                className="w-4 h-4 mr-2 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {classItem.entrenador_nombre}
            </div>
          )}
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Cupo: {classItem.cupo_maximo}
            {classItem.cupos_disponibles !== undefined && (
              <span className="ml-2 text-green-600 font-medium">
                ({classItem.cupos_disponibles} disponibles)
              </span>
            )}
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {reserva ? (
            <button
              onClick={() => onCancelReservation(reserva.id)}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Cancelar reserva
            </button>
          ) : (
            <button
              onClick={() => onReserve(classItem.id_clase)}
              disabled={classItem.cupos_disponibles === 0}
              className={`w-full font-medium py-2 px-4 rounded-lg transition duration-200 ${
                classItem.cupos_disponibles === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 text-white"
              }`}
            >
              {classItem.cupos_disponibles === 0 ? "Sin cupos" : "Reservar"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Para admin/entrenador: mostrar botones de editar/eliminar
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {classItem.nombre}
        </h3>
        {classItem.descripcion && (
          <p className="text-gray-600 text-sm">{classItem.descripcion}</p>
        )}
      </div>
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center text-sm text-gray-700">
          <svg
            className="w-4 h-4 mr-2 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {formatDate(classItem.horario)}
        </div>
        {classItem.entrenador_nombre && (
          <div className="flex items-center text-sm text-gray-700">
            <svg
              className="w-4 h-4 mr-2 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {classItem.entrenador_nombre}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-700">
          <svg
            className="w-4 h-4 mr-2 text-orange-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Cupo: {classItem.cupo_maximo}
          {classItem.cupos_disponibles !== undefined && (
            <span className="ml-2 text-green-600 font-medium">
              ({classItem.cupos_disponibles} disponibles)
            </span>
          )}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(classItem)}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(classItem.id_clase)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;
