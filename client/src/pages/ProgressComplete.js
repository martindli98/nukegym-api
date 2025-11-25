import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Bar,
  BarChart,
} from "recharts";
import axios from "axios";
import { useMembership } from "../hooks/useMembership";

function ProgressComplete() {
  const { idRutina } = useParams(); // id de la rutina
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);
  const { membership, loading: loadingMembership } = useMembership();

  useEffect(() => {
    if (membership?.membershipActive) {
      fetchProgress();
    }
  }, [membership]);

  const fetchProgress = async () => {
    setLoading(true);
    setNoData(false);

    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(
        `http://localhost:3000/api/progress/routine/${idRutina}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const progresos = response.data.data;

        if (progresos.length === 0) {
          setNoData(true);
          setData([]);
          return;
        }

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

        setData(agrupado);
      } else {
        setError("No se pudo obtener el listado");
      }
    } catch (err) {
      console.error(err);
      setError("Error al consultar el progreso.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingMembership)
    return <p className="text-center">Verificando membresía...</p>;

  if (!membership?.membershipActive) {
    return (
      <div className="text-center p-6">
        <h2 className="text-2xl font-bold text-red-500">Membresía inactiva</h2>
        <p className="mt-2 text-gray-600">
          Necesitas tener una membresía activa para ver tu progreso.
        </p>
        <button
          onClick={() => navigate("/membership")}
          className="mt-4 bg-orange-600 text-white px-4 py-2 rounded-lg"
        >
          Ir a membresía
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <button
        onClick={() => navigate("/progress")}
        className="mb-4 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-semibold text-lg"
      >
        ← Volver
      </button>

      <h2 className="text-3xl font-bold mb-8 text-center text-gray-800 dark:text-white">
        Progreso completo – Rutina #{idRutina}
      </h2>

      {error && (
        <p className="text-center text-red-500 font-semibold mb-4">{error}</p>
      )}

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400 italic">
          Cargando progreso...
        </p>
      )}

      {noData && !loading && (
        <p className="text-center text-gray-600 dark:text-gray-300 font-semibold">
          No hay progresos registrados aún para esta rutina.
        </p>
      )}

      {!loading && !noData && data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.map((ejercicio) => {
            const chartData = ejercicio.progresos.map((p) => ({
              fecha: new Date(p.fecha).toLocaleString("es-AR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              peso: Number(p.peso),
            }));

            return (
              <div
                key={ejercicio.id_ejercicio}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
                  {ejercicio.nombre}
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                    <XAxis
                      dataKey="fecha"
                      stroke="#4b5563"
                      tick={{ fill: "#8894a6" }}
                      dy={5}
                    />
                    <YAxis
                      label={{
                        value: "Peso (kg)",
                        angle: -90,
                        position: "insideLeft",
                        fill: "#4b5563",
                        offset: 10,
                      }}
                      stroke="#8894a6"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fef3c7",
                        borderRadius: "8px",
                        border: "none",
                      }}
                      labelStyle={{ color: "#b45309" }}
                      formatter={(value) => [`${value} kg`, "Peso"]}
                    />
                    <Bar dataKey="peso" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default ProgressComplete;
