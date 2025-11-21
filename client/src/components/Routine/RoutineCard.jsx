import React, { useState } from "react";

const RoutineCard = ({ ejercicio, index }) => {
  const [showInstructions, setShowInstructions] = useState(false);

  const steps = ejercicio.descripcion
    ? ejercicio.descripcion
        .split(".")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 transition hover:shadow-xl">
      {/* Título */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Ejercicio {index + 1}: {ejercicio.nombre}
      </h3>

      {/* Músculo */}
      <p className="text-orange-500 text-sm font-medium mb-4">
        Músculo principal: {ejercicio.musculo_principal}
      </p>

      {/* Imagen */}
      {ejercicio.url_media && (
        <img
          src={ejercicio.url_media}
          alt={ejercicio.nombre}
          className="w-full h-64 object-contain rounded-lg mx-auto mb-4 bg-white"
        />
      )}

      {/* Series y Reps en tarjeta */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 text-white p-4 rounded-xl text-center">
          <p className="text-xl font-bold">{ejercicio.series || 3}</p>
          <span className="text-sm opacity-80">Series</span>
        </div>
        <div className="bg-gray-700 text-white p-4 rounded-xl text-center">
          <p className="text-xl font-bold">{ejercicio.repeticiones || 12}</p>
          <span className="text-sm opacity-80">Reps</span>
        </div>
      </div>

      {/* Botón instrucciones */}
      <button
        onClick={() => setShowInstructions((prev) => !prev)}
        className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition w-full mb-2"
      >
        {showInstructions ? "Ocultar instrucciones" : "Ver instrucciones"}
      </button>

      {/* Instrucciones */}
      {showInstructions && (
        <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Instrucciones:
          </h5>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-200 space-y-2">
            {steps.map((step, i) => (
              <li key={i}>{step}.</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default RoutineCard;
