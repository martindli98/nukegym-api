function MembershipType({ title, img, descripcion, color = "purple" }) {
  const colorClasses = {
    purple: "from-purple-500 to-purple-700",
    blue: "from-blue-500 to-blue-700",
    yellow: "from-yellow-500 to-yellow-700",
    red: "from-red-500 to-red-700",
    green: "from-green-500 to-green-700",
  };

  return (
    <div
      className="
        bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex flex-col items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl
      "
    >
      {/* ICON / IMG */}
      <div
        className={`
          w-24 h-24 rounded-2xl flex items-center justify-center 
          bg-gradient-to-br ${colorClasses[color]} text-white shadow-lg
        `}
      >
        {img ? (
          <img
            src={img}
            alt={title}
            className="w-14 h-14 object-contain"
          />
        ) : (
          <span className="text-4xl font-bold">★</span>
        )}
      </div>

      {/* TITLE */}
      <h3 className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">
        {title}
      </h3>

      {/* DESCRIPTION */}
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {descripcion}
      </p>

      {/* CTA BUTTON */}
      <button
        className={`
          mt-4 w-full py-2 rounded-xl font-semibold text-white 
          bg-gradient-to-r ${colorClasses[color]}
          hover:opacity-90 transition-all duration-200
        `}
      >
        Ver detalles
      </button>
    </div>
  );
}

export default MembershipType;
