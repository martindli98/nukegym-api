// app/progress/progressComplete.tsx

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, Dimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { api } from "@/src/utils/api";
import { LineChart } from "react-native-chart-kit";

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Progreso completo – Rutina #{idRutina}</Text>

      {data.map((ej) => (
        <View key={ej.id_ejercicio} style={styles.card}>
          <Text style={styles.cardTitle}>{ej.nombre}</Text>

          <LineChart
            data={{
              labels: ej.progresos.map((p) =>
                new Date(p.fecha).toLocaleDateString("es-AR")
              ),
              datasets: [
                {
                  data: ej.progresos.map((p) => p.peso),
                },
              ],
            }}
            width={screenWidth}
            height={250}
            chartConfig={{
              backgroundColor: "#ffffff",
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#2563eb",
              },
            }}
            bezier
            style={{
              marginVertical: 10,
              borderRadius: 12,
            }}
          />
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
});
