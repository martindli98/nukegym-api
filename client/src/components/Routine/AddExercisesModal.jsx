import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AddExercisesModal = ({ onClose, onSubmit, existingExercises }) => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const res = await axios.get("http://localhost:3000/api/exercises", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const existingIds = existingExercises.map((e) => e.id);
        setExercises(res.data.filter((ex) => !existingIds.includes(ex.id)));
      } catch (error) {
        toast.error("Error al cargar ejercicios");
      }
    };
    fetchExercises();
  }, [existingExercises]);

  const filteredExercises = exercises.filter((ex) =>
    ex.musculo_principal?.toLowerCase().includes(filter.toLowerCase())
  );

  const toggleExercise = (ex) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id_ejercicio === ex.id);
      if (exists) return prev.filter((e) => e.id_ejercicio !== ex.id);
      return [...prev, { id_ejercicio: ex.id, series: 3, repeticiones: 12 }];
    });
  };

  const updateField = (id, field, value) => {
    setSelectedExercises((prev) =>
      prev.map((e) =>
        e.id_ejercicio === id ? { ...e, [field]: Number(value) } : e
      )
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-11/12 max-w-5xl p-6 overflow-y-auto max-h-[85vh]">
        <button
          onClick={onClose}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Volver
        </button>
        <h2 className="text-black dark:text-orange-500 text-2xl font-bold mb-4 text-center">
          Agregar Ejercicios
        </h2>
        <input
          type="text"
          placeholder="Filtrar por músculo..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white text-gray-300 dark:bg-gray-800 w-full p-2 rounded mb-4"
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredExercises.map((ex) => {
            const selected = selectedExercises.find(
              (e) => e.id_ejercicio === ex.id
            );
            return (
              <div
                key={ex.id}
                className={`bg-white dark:bg-gray-800 rounded-lg cursor-pointer transition ${
                  selected
                    ? "bg-purple-100 dark:bg-purple-900/40 border border-purple-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                onClick={() => toggleExercise(ex)}
              >
                {ex.url_media && (
                  <img
                    src={ex.url_media}
                    alt={ex.nombre}
                    className="w-full h-30 object-cover rounded"
                  />
                )}
                <div className="p-3">
                  <h4 className="text-black dark:text-orange-500 text-sm font-semibold">
                    {ex.nombre}
                  </h4>
                  <p className="text-xs dark:text-gray-400 text-gray-500">
                    {ex.musculo_principal}
                  </p>
                </div>
                {selected && (
                  <div
                    className="p-2 space-y-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Series
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selected.series}
                        onChange={(e) =>
                          updateField(ex.id, "series", e.target.value)
                        }
                        className="text-black dark:text-white bg-white dark:bg-purple-950/80 w-20 p-1 rounded-md text-sm text-right"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Repeticiones
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selected.repeticiones}
                        onChange={(e) =>
                          updateField(ex.id, "repeticiones", e.target.value)
                        }
                        className="text-black dark:text-white bg-white dark:bg-purple-950/80 w-20 p-1 rounded-md text-sm text-right"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (selectedExercises.length) onSubmit(selectedExercises);
              else toast.error("Selecciona al menos un ejercicio");
            }}
            className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExercisesModal;
