function InfoCard({ estado, inicio, fin, tipo }) {
  console.log(tipo)
  const tipoTexto =
    tipo === 1 ? "Básico" :
    tipo === 2 ? "Medio" :
    tipo === 3 ? "Libre" :
    "Desconocido";

  return (
    <div
      className="
        p-8 
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700 
        rounded-2xl shadow-lg
        hover:-translate-y-1 transition-all duration-300
      "
    >
      <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-4">
        🧾 Detalles de la membresía
      </h3>

      <div className="space-y-3 text-sm">

        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Estado:</span>{" "}
          <span className={`${estado === "activo" ? "text-green-500" : "text-red-400"} ml-1`}>
            {estado}
          </span>
        </p>

        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Tipo de membresía:</span>{" "}
          <span className="ml-1 text-orange-500 dark:text-orange-400 font-medium">
            {tipoTexto}
          </span>
        </p>

        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Inicio:</span>{" "}
          {inicio}
        </p>

        <p className="text-gray-700 dark:text-gray-300">
          <span className="font-semibold text-gray-900 dark:text-gray-100">Fin:</span>{" "}
          {fin}
        </p>

      </div>

      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-3 text-xs text-gray-500 dark:text-gray-400">
        Esta sección muestra la información actualizada de tu membresía.
      </div>
    </div>
  );
}

export default InfoCard;
