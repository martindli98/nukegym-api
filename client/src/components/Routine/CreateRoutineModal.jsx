import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const CreateRoutineModal = ({ studentId, trainerId, onClose }) => {
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [name, setName] = useState("");
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const res = await axios.get("http://localhost:3000/api/exercises", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExercises(res.data);
      } catch (error) {
        console.error("Error al cargar ejercicios:", error);
        toast.error("Error al cargar ejercicios");
      }
    };
    fetchExercises();
  }, []);

  useEffect(() => {
    const lower = filter.toLowerCase();
    const filtered = exercises.filter((ex) =>
      ex.musculo_principal?.toLowerCase().includes(lower)
    );
    setFilteredExercises(filtered);
  }, [filter, exercises]);

  const toggleExercise = (ex) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id_ejercicio === ex.id);
      if (exists) {
        return prev.filter((e) => e.id_ejercicio !== ex.id);
      }
      return [
        ...prev,
        { id_ejercicio: ex.id, nombre: ex.nombre, series: 3, repeticiones: 12 },
      ];
    });
  };

  const updateExerciseField = (id, field, value) => {
    setSelectedExercises((prev) =>
      prev.map((e) =>
        e.id_ejercicio === id ? { ...e, [field]: Number(value) } : e
      )
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Debes poner un nombre a la rutina");
      return;
    }
    if (selectedExercises.length === 0) {
      toast.error("Selecciona al menos un ejercicio");
      return;
    }
    try {
      console.log("🧠 Datos que se envían al backend:", {
        id_usuario: studentId,
        id_entrenador: trainerId || null,
        fecha: new Date(),
        objetivo: name,
        ejercicios: selectedExercises.map((ej) => ({
          id_ejercicio: ej.id_ejercicio || ej.id,
          series: ej.series || 3,
          repeticiones: ej.repeticiones || 12,
        })),
      });
      const token = sessionStorage.getItem("authToken");
      await axios.post(
        "http://localhost:3000/api/routine",
        {
          id_usuario: studentId,
          id_entrenador: trainerId || null,
          fecha: new Date(),
          objetivo: name,
          ejercicios: selectedExercises.map((ex) => ({
            id_ejercicio: ex.id_ejercicio,
            series: ex.series,
            repeticiones: ex.repeticiones,
          })),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Rutina creada correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("Error al crear la rutina");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-5xl p-6 overflow-y-auto max-h-[85vh]">
        <button
          onClick={onClose}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
        >
          Volver
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center">Crear Rutina</h2>

        <h3 className="text-xl mb-2">Ingrese el nombre de la rutina:</h3>
        <input
          type="text"
          placeholder="Ej: Día 1: Pecho y Tríceps"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />

        <h5 className="text-base mb-2 text-gray-500">Filtrar por músculo</h5>
        <input
          type="text"
          placeholder="Ej: pecho, espalda..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border w-full p-2 rounded mb-4"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredExercises.map((ex) => {
            const selected = selectedExercises.find(
              (e) => e.id_ejercicio === ex.id
            );
            return (
              <div
                key={ex.id}
                className={`p-2 border rounded-lg cursor-pointer transition ${
                  selected
                    ? "bg-purple-200 border-purple-600"
                    : "hover:bg-gray-100"
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
                <h4 className="text-sm font-semibold mt-2">{ex.nombre}</h4>
                <p className="text-xs text-gray-500">{ex.musculo_principal}</p>

                {selected && (
                  <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs text-gray-700">Series:</label>
                      <input
                        type="number"
                        min="1"
                        value={selected.series}
                        onChange={(e) =>
                          updateExerciseField(ex.id, "series", e.target.value)
                        }
                        className="border w-16 p-1 rounded text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-gray-700">
                        Repeticiones:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selected.repeticiones}
                        onChange={(e) =>
                          updateExerciseField(
                            ex.id,
                            "repeticiones",
                            e.target.value
                          )
                        }
                        className="border w-16 p-1 rounded text-sm"
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
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-800 text-white px-4 py-2 rounded"
          >
            Guardar Rutina
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoutineModal;
