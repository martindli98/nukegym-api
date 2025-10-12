import React from "react";

const ReservationCard = ({ reservation, formatDate, onCancelReservation }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          {reservation.nombre}
        </h3>
        {reservation.descripcion && (
          <p className="text-gray-600 text-sm">{reservation.descripcion}</p>
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
          {formatDate(reservation.horario)}
        </div>
        {reservation.entrenador_nombre && (
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
            {reservation.entrenador_nombre}
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
          Cupo: {reservation.cupo_maximo}
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <button
          onClick={() => onCancelReservation(reservation.id)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          Cancelar reserva
        </button>
      </div>
    </div>
  );
};

export default ReservationCard;
