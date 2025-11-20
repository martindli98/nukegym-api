function MembershipCard({ title, img, descripcion }) {
  return (
    <div
      className="
        flex flex-col items-center text-center p-8 
        bg-white dark:bg-gray-800
        rounded-2xl 
      "
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-wide">
        {title}
      </h3>

      <img
        src={img}
        alt="estado"
        className="w-28 h-28 mt-4 mb-4"
      />

      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {descripcion}
      </p>

      <div className="w-24 h-1 mt-6 bg-gradient-to-r from-green-500 to-purple-500 rounded-full"></div>
    </div>
  );
}

export default MembershipCard;
