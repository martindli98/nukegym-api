import React, { useState } from "react";
import { toast } from "react-toastify";

const RoutineCard = ({ ejercicio, index, onUpdate, onDelete }) => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [series, setSeries] = useState(ejercicio.series || 3);
  const [repeticiones, setRepeticiones] = useState(
    ejercicio.repeticiones || 12
  );

  const steps =
    ejercicio.descripcion
      ?.split(".")
      .map((s) => s.trim())
      .filter((s) => s.length > 0) || [];

  const handleSave = () => {
    if (series < 1 || series > 99 || repeticiones < 1 || repeticiones > 99) {
      toast.error("Los valores deben estar entre 1 y 99.");
      return;
    }

    onUpdate(ejercicio.id, series, repeticiones);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSeries(ejercicio.series || 3);
    setRepeticiones(ejercicio.repeticiones || 12);
    setIsEditing(false);
  };

  const InputField = ({ value, onChange, label }) => {
    const handleChange = (e) => {
      let num = Number(e.target.value);

      // Evita NaN y limita el rango 1–99
      if (isNaN(num)) num = "";
      if (num < 1) num = 1;
      if (num > 99) num = 99;

      onChange(num);
    };

    return (
      <div className="bg-gray-700 text-white p-4 rounded-xl text-center">
        {isEditing ? (
          <input
            type="number"
            value={value}
            onChange={handleChange}
            className="w-full bg-gray-600 text-center text-xl font-bold rounded p-1"
            min="1"
            max="99"
          />
        ) : (
          <p className="text-xl font-bold">{value}</p>
        )}
        <span className="text-sm opacity-80">{label}</span>
      </div>
    );
  };

  const Button = ({ onClick, color, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 bg-${color}-600 hover:bg-${color}-700 text-white px-4 py-2 rounded-lg transition`}
    >
      {children}
    </button>
  );

  return (
    <div className="relative bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 transition hover:shadow-xl">
      {!isEditing && (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>

          <button
            onClick={() => onDelete(ejercicio.id)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md shadow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      )}

      {/* CONTENIDO ORIGINAL */}
      <div className="min-h-[60px] flex items-start">
        {/* <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"> */}
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight break-words">
          Ejercicio {index + 1}: {ejercicio.nombre}
        </h3>
      </div>
      <p className="text-orange-500 text-sm font-medium mb-3">
        Músculo principal: {ejercicio.musculo_principal}
      </p>

      {ejercicio.url_media && (
        <img
          src={ejercicio.url_media}
          alt={ejercicio.nombre}
          className="w-full h-64 object-contain rounded-lg mx-auto mb-4 bg-white"
        />
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <InputField value={series} onChange={setSeries} label="Series" />
        <InputField
          value={repeticiones}
          onChange={setRepeticiones}
          label="Reps"
        />
      </div>

      {isEditing && (
        <div className="flex gap-2 mb-4">
          <Button onClick={handleSave} color="green">
            Guardar
          </Button>
          <Button onClick={handleCancel} color="gray">
            Cancelar
          </Button>
        </div>
      )}

      <button
        onClick={() => setShowInstructions((prev) => !prev)}
        className="text-sm bg-gray-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition w-full mb-2"
      >
        {showInstructions ? "Ocultar instrucciones" : "Ver instrucciones"}
      </button>

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
