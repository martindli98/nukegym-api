function InfoCard({ estado, inicio, fin, tipo }) {
  return (
    <div
      className="bg-white dark:bg-[oklch(12.9%_0.042_264.695)]
                 text-gray-800 dark:text-white
                 shadow-lg rounded-2xl p-6 w-full
                 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-5 h-5 text-purple-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-base font-semibold text-purple-400">Detalles</h3>
      </div>

      <div className="space-y-3 text-sm text-gray-700 dark:text-purple-200">
        <p>
          <span className="font-semibold text-black dark:text-white">Estado:</span>{" "}
          <span
            className={`${
              estado === "activo" ? "text-green-400" : "text-red-400"
            } font-medium`}
          >
            {estado}
          </span>
        </p>

        <p>
          <span className="font-semibold text-black dark:text-white">Inicio:</span> {inicio}
        </p>

        <p>
          <span className="font-semibold text-black dark:text-white">Fin:</span> {fin}
        </p>

        <p>
          <span className="font-semibold text-black dark:text-white">Tipo:</span>{" "}
          {tipo || "—"}
        </p>
      </div>

      <div className="mt-5 text-gray-500 dark:text-purple-300 text-xs border-t border-purple-700/50 pt-3">
        No se q mas poner
      </div>
    </div>
  );
}

export default InfoCard;
