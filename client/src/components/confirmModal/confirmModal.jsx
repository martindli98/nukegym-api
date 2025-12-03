import React from "react";
import { createPortal } from "react-dom";

const ConfirmModal = ({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return createPortal(
    (
      <div
        className="
          fixed inset-0 
          z-[9999] 
          flex items-center justify-center 
          bg-black/50 backdrop-blur-sm
        "
        onClick={onCancel}
      >
        <div
          className="
            bg-white dark:bg-gray-800 
            p-6 rounded-xl shadow-2xl 
            w-full max-w-md
          "
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {title}
          </h2>

          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {message}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    ),
    document.getElementById("modal-root") // 🔥 AQUÍ SE RENDERIZA FUERA DEL BODY
  );
};

export default ConfirmModal;
