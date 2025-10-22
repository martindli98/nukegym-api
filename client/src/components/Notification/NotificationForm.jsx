import React from "react";

const NotificationForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  // Obtener fecha y hora mínima (ahora)
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 8);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-6 rounded-lg shadow-md mb-6"
    >
      <div className="mb-4">
        <label
          htmlFor="titulo"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="titulo"
          placeholder="Título de la notificación"
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
          maxLength={100}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.titulo.length}/100 caracteres
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="mensaje"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Mensaje <span className="text-red-500">*</span>
        </label>
        <textarea
          id="mensaje"
          placeholder="Contenido de la notificación"
          value={formData.mensaje}
          onChange={(e) =>
            setFormData({ ...formData, mensaje: e.target.value })
          }
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
          maxLength={255}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.mensaje.length}/255 caracteres
        </p>
      </div>

      <div className="mb-4">
        <label
          htmlFor="fecha_envio"
          className="block text-gray-700 text-sm font-bold mb-2"
        >
          Fecha de envío
        </label>
        <input
          type="datetime-local"
          id="fecha_envio"
          required
          value={formData.fecha_envio}
          onChange={(e) =>
            setFormData({ ...formData, fecha_envio: e.target.value })
          }
          min={minDateTime}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          {formData.fecha_envio
            ? "Notificación programada para: " +
              new Date(formData.fecha_envio).toLocaleString()
            : ""}
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          {isEditing ? "Actualizar Notificación" : "Enviar Notificación"}
        </button>
      </div>
    </form>
  );
};

export default NotificationForm;
