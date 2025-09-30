import React from "react";

const RoutineCard = ({ exercise }) => {
  return (
    <div
      key={exercise.exerciseId}
      className="bg-white shadow-xl rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-orange-500"
    >
      {/* Imagen del ejercicio o placeholder */}
      <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center relative overflow-hidden">
        {exercise.imageUrl ? (
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className="flex flex-col items-center justify-center text-orange-400 p-4">
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-6">
        {/* Nombre del ejercicio */}
        <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-1 mb-4 capitalize leading-tight">
          {exercise.name}
        </h3>

        {/* Tipo de ejercicio */}
        <div className="mb-4">
          <span className="inline-block bg-orange-100 text-orange-800 text-sm sm:text-base px-4 py-2 rounded-full font-bold shadow-sm">
            📝 {exercise.exerciseType || "Tipo no especificado"}
          </span>
        </div>

        {/* Músculos objetivo */}
        {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2 border-b border-orange-300 pb-1">
              🎯 Músculos objetivo:
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-semibold shadow-md"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Equipamiento */}
        {exercise.equipments && exercise.equipments.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2 border-b border-orange-300 pb-1">
              🏋️ Equipamiento:
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.equipments.map((equipment, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-semibold shadow-md"
                >
                  {equipment}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Partes del cuerpo */}
        {exercise.bodyParts && exercise.bodyParts.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 mb-2 border-b border-orange-300 pb-1">
              🎯 Partes del cuerpo:
            </h4>
            <div className="flex flex-wrap gap-2">
              {exercise.bodyParts.map((bodyPart, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs sm:text-sm px-3 py-1 rounded-full font-semibold shadow-md"
                >
                  {bodyPart}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoutineCard;
