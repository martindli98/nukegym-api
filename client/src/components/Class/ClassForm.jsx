
const ClassForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  editingClass,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">

      {/* --- Primera fila: Nombre + Cupo --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre de la Clase
          </label>
          <input
            type="text"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              placeholder-gray-400 dark:placeholder-gray-500
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-orange-500 focus:border-transparent
              transition-colors"
            placeholder="Ej: Yoga, CrossFit, Pilates"
            required
          />
        </div>

        {/* Cupo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cupo Máximo
          </label>
          <input
            type="number"
            min="1"
            max="101"
            value={formData.cupo_maximo}
            onChange={(e) =>
              setFormData({
                ...formData,
                cupo_maximo: parseInt(e.target.value),
              })
            }
            className="w-full px-4 py-3 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-orange-500 focus:border-transparent
              transition-colors"
            required
          />
        </div>
      </div>

      {/* --- Descripción --- */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          value={formData.descripcion}
          onChange={(e) =>
            setFormData({ ...formData, descripcion: e.target.value })
          }
          rows="3"
          placeholder="Describe la clase..."
          className="w-full px-4 py-3 rounded-lg
            bg-white dark:bg-gray-700
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            border border-gray-300 dark:border-gray-600
            focus:ring-2 focus:ring-orange-500 focus:border-transparent
            transition-colors"
        />
      </div>

      {/* --- Fecha + Horarios --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Día *
          </label>
          <input
            type="date"
            value={formData.fecha || ""}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) =>
              setFormData({ ...formData, fecha: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Hora inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de inicio *
          </label>
          <input
            type="time"
            value={formData.horario_inicio || ""}
            onChange={(e) =>
              setFormData({ ...formData, horario_inicio: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>

        {/* Hora fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Hora de fin *
          </label>
          <input
            type="time"
            value={formData.horario_fin || ""}
            onChange={(e) =>
              setFormData({ ...formData, horario_fin: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg
              bg-white dark:bg-gray-700
              text-gray-900 dark:text-gray-100
              border border-gray-300 dark:border-gray-600
              focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* --- Botones --- */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          className="flex-1 bg-orange-500 hover:bg-orange-600 
            text-white font-semibold py-3 px-6 rounded-lg 
            transition-all active:scale-95"
        >
          {editingClass ? "Actualizar Clase" : "Crear Clase"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 
            text-white font-semibold py-3 px-6 rounded-lg 
            transition-all active:scale-95"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default ClassForm;
