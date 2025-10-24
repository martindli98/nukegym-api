
function MembershipCard({ title, img, descripcion}) {
  return (
    <div
      className="bg-white dark:bg-[oklch(12.9%_0.042_264.695)]
                 text-gray-800 dark:text-white
                 shadow-lg rounded-2xl p-6
                 flex flex-col items-center text-center
                 w-full transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-base font-semibold text-black uppercase tracking-wide dark:text-white">
          {title}
        </h3>
      </div>

      <img
        src={img}
        alt="Membresía"
        className="w-28 h-28 object-cover shadow-inner my-4"
      />

      <p className="text-gray-600 dark:text-purple-200 text-sm mt-2">
        {descripcion}
      </p>

      {/* Línea decorativa */}
      <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-purple-600 rounded-full mt-4"></div>
  
    </div>

  );
}

export default MembershipCard;
