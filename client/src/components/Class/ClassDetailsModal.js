import React from "react";
import ReactDOM from "react-dom";

const ClassDetailsModal = ({ isOpen, onClose, classDetails, students }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      
      {/* Contenedor del modal */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl w-full max-w-lg transform scale-95 animate-fadeInUp border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {classDetails?.nombre}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-orange-500 dark:hover:text-orange-400 transition text-xl"
          >
            ✕
          </button>
        </div>

        {/* Información de la clase */}
        <div className="space-y-2 mb-6 text-gray-700 dark:text-gray-300">
          <p><b className="text-gray-900 dark:text-gray-100">Descripción:</b> {classDetails?.descripcion || "Sin descripción"}</p>
          <p><b className="text-gray-900 dark:text-gray-100">Fecha y horario:</b> {classDetails?.horario}</p>
          <p><b className="text-gray-900 dark:text-gray-100">Cupo máximo:</b> {classDetails?.cupo_maximo}</p>
          <p><b className="text-gray-900 dark:text-gray-100">Cupos disponibles:</b> {classDetails?.cupos_disponibles}</p>
        </div>

        {/* Lista de alumnos */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Alumnos inscriptos
          </h3>

          {students.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No hay alumnos inscriptos.
            </p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {students.map((s) => (
                <li
                  key={s.id_usuario}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {s.nombre} {s.apellido}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer opcional */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg shadow-lg transition duration-200"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ClassDetailsModal;
