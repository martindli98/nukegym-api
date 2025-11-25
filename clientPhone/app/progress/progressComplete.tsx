// app/progress/progressComplete.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  useColorScheme,
} from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { api } from "@/src/utils/api";
import { LineChart, BarChart } from "react-native-chart-kit";

interface ProgresoItem {
  id_ejercicio: number;
  nombre_ejercicio: string;
  fecha_uno: string;
  peso: number;
}

interface EjercicioAgrupado {
  id_ejercicio: number;
  nombre: string;
  progresos: { fecha: string; peso: number }[];
}

const screenWidth = Dimensions.get("window").width - 32;

export default function ProgressComplete() {
  const { idRutina } = useLocalSearchParams();
  const [data, setData] = useState<EjercicioAgrupado[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme();
  const isDark = theme === "dark";

  // 🔥 AQUI SE CAMBIA EL TÍTULO DEL HEADER
  // Esto reemplaza "progress/progressComplete"
  // por "Progreso de la rutina #X"
  return (
    <>
      <Stack.Screen
        options={{
          title: `Progreso de la rutina #${idRutina}`,
        }}
      />

      <Content
        idRutina={idRutina}
        data={data}
        setData={setData}
        loading={loading}
        setLoading={setLoading}
        isDark={isDark}
      />
    </>
  );
}

function Content({ idRutina, data, setData, loading, setLoading, isDark }: any) {
  const fetchProgress = async () => {
    try {
      const res = await api(`/progress/routine/${idRutina}`);
      if (!res.success) return;

      const progresos: ProgresoItem[] = res.data;

      const agrupado = Object.values(
        progresos.reduce((acc: any, item: ProgresoItem) => {
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
    } catch (err) {
      console.log("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const styles = StyleSheet.create({
    container: {
      padding: 16,
      flex: 1,
      backgroundColor: isDark ? "#111827" : "#f3f4f6",
    },

    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    title: {
      fontSize: 24,
      fontWeight: "800",
      marginBottom: 20,
      textAlign: "center",
      color: "#f97316",
    },

    card: {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      padding: 16,
      borderRadius: 14,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: isDark ? 0.35 : 0.12,
      shadowRadius: 6,
      elevation: isDark ? 6 : 3,
    },

    cardTitle: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 14,
      color: isDark ? "#e5e7eb" : "#111827",
    },
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  const cardHorizontalPadding = 16;
  const chartWidth = screenWidth - cardHorizontalPadding * 2;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progreso completo – Rutina #{idRutina}</Text>

      {data.map((ej: any) => (
        <View key={ej.id_ejercicio} style={styles.card}>
          <Text style={styles.cardTitle}>{ej.nombre}</Text>

          {/* LINE CHART */}
          <View style={{ width: "100%", alignItems: "center" }}>
            <LineChart
              data={{
                labels: ej.progresos.map((p: any) =>
                  new Date(p.fecha).toLocaleDateString("es-AR")
                ),
                datasets: [{ data: ej.progresos.map((p: any) => p.peso) }],
              }}
              width={chartWidth}
              height={250}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#2563eb",
                },
              }}
              bezier
              style={{ marginVertical: 10, borderRadius: 12 }}
            />
          </View>

          {/* BAR CHART */}
          <View style={{ width: "100%", alignItems: "center" }}>
            <BarChart
              data={{
                labels: ej.progresos.map((p: any) =>
                  new Date(p.fecha).toLocaleDateString("es-AR")
                ),
                datasets: [{ data: ej.progresos.map((p: any) => p.peso) }],
              }}
              width={chartWidth}
              height={250}
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(249,115,22,${opacity})`,
                labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              style={{ marginVertical: 10, borderRadius: 12 }}
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
