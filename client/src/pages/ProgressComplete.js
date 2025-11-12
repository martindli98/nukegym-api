import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import axios from "axios";

function ProgressComplete() {
  const { idRutina} = useParams(); // id de la rutina
  const [data, setData] = useState([]);
  const [error, setError]= useState();

    const fetchProgress = async () => {
       
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`http://localhost:3000/api/progress/routine/${idRutina}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success) {
            const progresos = response.data.data;

            const agrupado = Object.values(
              progresos.reduce((acc, item) => {
                if (!acc[item.id_ejercicio]) {
                  acc[item.id_ejercicio] = {
                    id_ejercicio: item.id_ejercicio,
                    nombre: item.nombre_ejercicio,
                    progresos: [],
                  };
                }
                acc[item.id_ejercicio].progresos.push({
                  fecha: item.fecha_uno,
                  peso: item.peso,
                });
                return acc;
              }, {})
            );

            console.log("Agrupado:", agrupado);
            setData(agrupado);
          }else {
          setError(response.data || "No se pudo obtener el listado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al consultar la membresía.");
      }}

      useEffect(() => {
        fetchProgress();  // se ejecuta una sola vez
      }, []);
      
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Progreso completo – Rutina #{idRutina}
      </h2>

      {error && (
        <p className="text-center text-red-500 font-semibold mb-4">{error}</p>
      )}

      {data.length > 0 ? (
        <div className="space-y-12">
          {data.map((ejercicio) => (
            <div
              key={ejercicio.id_ejercicio}
              className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-700">
                {ejercicio.nombre}
              </h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={ejercicio.progresos.map((p) => ({
                    fecha: new Date(p.fecha).toLocaleDateString("es-AR"),
                    peso: p.peso,
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis label={{ value: "Peso (kg)", angle: -90, position: "insideLeft" }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="peso"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 italic">
          Cargando datos o no hay progreso registrado aún...
        </p>
      )}
    </div>
  );
}

export default ProgressComplete;
