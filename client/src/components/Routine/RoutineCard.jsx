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
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl shadow-md mb-6 transition hover:shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Ejercicio {index + 1}: {ejercicio.nombre}
      </h3>
      <p className="text-orange-500 text-sm font-light mb-3">
        Músculo principal: {ejercicio.musculo_principal}
      </p>
      {ejercicio.url_media && (
        <img
          src={ejercicio.url_media}
          alt={ejercicio.nombre}
          className="w-full md:w-2/4 h-60 object-contain rounded-lg mx-auto mb-3 bg-white"
        />
      )}

      <div className="flex justify-center text-center text-gray-700 dark:text-gray-300 mb-3 py-3">
        <div className="bg-gray-600 rounded p-2 mr-20">
          <strong>{ejercicio.series || 3}</strong>
          <p className="text-sm">Series</p>
        </div>
        <div className="bg-gray-600 rounded p-2 ml-20">
          <strong>{ejercicio.repeticiones || 12}</strong>
          <p className="text-sm">Reps</p>
        </div>
      </div>
      <div className="flex justify-center items-center">
        <button
          onClick={() => setShowInstructions((prev) => !prev)}
          className="text-sm bg-purple-600 hover:bg-purple-800 text-white px-3 py-2 rounded-lg justify-center w-2/4"
        >
          {showInstructions ? "Ocultar instrucciones" : "Ver instrucciones"}
        </button>
      </div>
      {showInstructions && (
        <div className="mt-4 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Instrucciones:
          </h5>
          <ol className="list-decimal list-inside text-gray-700 dark:text-gray-200 space-y-1">
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
