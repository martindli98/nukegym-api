import React from "react";

const RoutineCard = ({ ejercicio }) => {
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition">
      {ejercicio.url_media && (
        <img
          src={ejercicio.url_media}
          alt={ejercicio.nombre}
          className="w-full h-40 object-cover rounded-md mb-3"
        />
      )}
      <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
        {ejercicio.nombre}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {ejercicio.descripcion}
      </p>
    </div>
  );
};

export default RoutineCard;
