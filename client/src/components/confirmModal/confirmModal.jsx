import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
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
          animate-[fadeIn_0.15s_ease-out]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
          {title}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="
              px-4 py-2 rounded-lg 
              bg-gray-300 dark:bg-gray-700 
              hover:bg-gray-400 dark:hover:bg-gray-600 
              dark:text-gray-200
            "
          >
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
