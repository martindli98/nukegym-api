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
  getDetails
}) => {
  const reserva = userReservations?.find(
    (r) => r.id_clase === classItem.id_clase && r.estado === "reservado"
  );

  return (
    <div
      className="
        flex flex-col h-full
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-2xl shadow-lg
        hover:shadow-xl hover:-translate-y-1
        transition-all duration-300
        overflow-hidden
      "
    >
      {/* HEADER */}
      <div className="bg-gray-200 dark:bg-gray-900  px-6 py-4">
        <h3 className="text-xl font-bold text-black dark:text-orange-500 tracking-wide">
          {classItem.nombre}
        </h3>

        {classItem.descripcion && (
          <p className="text-gray-600 dark:text-orange-100 text-sm mt-1">
            {classItem.descripcion}
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-6 py-5 space-y-4">

        {/* Fecha */}
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <svg
            className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400"
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
          <span className="font-medium">{formatDate(classItem.horario)}</span>
        </div>

        {/* Entrenador */}
        {classItem.entrenador_nombre && (
          <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <svg
              className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400"
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
            <span className="font-medium">{classItem.entrenador_nombre}</span>
          </div>
        )}

        {/* Cupos */}
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <svg
            className="w-5 h-5 mr-2 text-orange-600 dark:text-orange-400"
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
            <span
              className={`ml-2 font-semibold ${
                classItem.cupos_disponibles === 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            >
              ({classItem.cupos_disponibles} disponibles)
            </span>
          )}
        </div>
        <button
          onClick={() => getDetails(classItem)}
          className="
            w-full
            mt-3
            py-2.5
            text-sm
            font-semibold
            rounded-xl
            border border-orange-500
            text-orange-600
            dark:text-orange-400
            hover:bg-orange-50 dark:hover:bg-gray-800
            transition-all
            active:scale-95
          "
        >
          Ver detalles
        </button>

      </div>

      {/* BOTONES */}
      <div className="mt-auto px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        {isClient ? (
          reserva ? (
            <button
              onClick={() => onCancelReservation(reserva.id)}
              className="
                w-full bg-red-500 hover:bg-red-600
                text-white font-semibold py-2.5 rounded-xl
                transition active:scale-95
              "
            >
              Cancelar reserva
            </button>
          ) : (
            <button
              onClick={() => onReserve(classItem.id_clase)}
              disabled={classItem.cupos_disponibles === 0}
              className={`
                w-full font-semibold py-2.5 rounded-xl transition active:scale-95
                ${
                  classItem.cupos_disponibles === 0
                    ? "bg-green-300 dark:bg-green-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
              `}
            >
              {classItem.cupos_disponibles === 0 ? "Sin cupos" : "Reservar"}
            </button>
          )
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(classItem)}
              className="
                flex-1 bg-blue-600 hover:bg-blue-700
                text-white font-semibold py-2.5 rounded-xl
                transition active:scale-95
              "
            >
              Editar
            </button>

            <button
              onClick={() => onDelete(classItem.id_clase)}
              className="
                flex-1 bg-red-600 hover:bg-red-700
                text-white font-semibold py-2.5 rounded-xl
                transition active:scale-95
              "
            >
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
