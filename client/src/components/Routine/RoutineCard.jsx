import React, { useState } from "react";

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
    onUpdate(ejercicio.id, series, repeticiones);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setSeries(ejercicio.series || 3);
    setRepeticiones(ejercicio.repeticiones || 12);
    setIsEditing(false);
  };

  const InputField = ({ value, onChange, label }) => (
    <div className="bg-gray-700 text-white p-4 rounded-xl text-center">
      {isEditing ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-gray-600 text-center text-xl font-bold rounded p-1"
          min="1"
        />
      ) : (
        <p className="text-xl font-bold">{value}</p>
      )}
      <span className="text-sm opacity-80">{label}</span>
    </div>
  );

  const Button = ({ onClick, color, children }) => (
    <button
      onClick={onClick}
      className={`flex-1 bg-${color}-600 hover:bg-${color}-700 text-white px-4 py-2 rounded-lg transition`}
    >
      {children}
    </button>
  );

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl shadow-lg mb-6 transition hover:shadow-xl">
      <div className="min-h-[40px]">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
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

      <div className="flex gap-2 mb-2">
        {isEditing ? (
          <>
            <Button onClick={handleSave} color="green">
              Guardar
            </Button>
            <Button onClick={handleCancel} color="gray">
              Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => setIsEditing(true)} color="blue">
              Editar
            </Button>
            <Button onClick={() => onDelete(ejercicio.id)} color="red">
              Eliminar
            </Button>
          </>
        )}
      </div>

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
