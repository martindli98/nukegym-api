import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ClassCard from "./ClassCard";
import ReservationCard from "./ReservationCard";
import ClassForm from "./ClassForm";
import { api } from "../../src/utils/api";

const ClassesScreen: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedUser = await AsyncStorage.getItem("userData");
          const storedToken = await AsyncStorage.getItem("authToken");

          if (storedUser && storedToken) {
            setUserData(JSON.parse(storedUser));
            setAuthToken(storedToken);
          } else {
            setUserData(null);
            setAuthToken(null);
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
        } finally {
          setLoading(false);
        }
      };
      loadUserData();
    }, [])
  );

  const fetchClasses = async (token: string) => {
    try {
      setLoading(true);
      const response = await api("/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClasses(response);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las clases.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (token: string) => {
    try {
      const response = await api("/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(response);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (userData && authToken) {
      fetchClasses(authToken);
      if (userData.tipo_rol?.toLowerCase() === "cliente") {
        fetchReservations(authToken);
      }
    }
  }, [userData, authToken]);

  const reserveClass = async (id: number) => {
    if (!authToken) return;
    try {
      await api("/reservations", {
        method: "POST",
        data: { id_clase: id },
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Alert.alert("Éxito", "Reserva realizada correctamente");
      fetchClasses(authToken);
      fetchReservations(authToken);
    } catch (error) {
      Alert.alert("Error", "No se pudo reservar la clase");
      console.error(error);
    }
  };

  const cancelReservation = async (id: number) => {
    if (!authToken) return;
    try {
      await api(`/reservations/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Alert.alert("Cancelado", "Reserva cancelada");
      fetchReservations(authToken);
    } catch (error) {
      Alert.alert("Error", "No se pudo cancelar la reserva");
      console.error(error);
    }
  };

  const handleCreateClass = async (data: any) => {
    try {
      await api("/classes", {
        method: "POST",
        data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Alert.alert("Éxito", "Clase creada correctamente");
      fetchClasses(authToken!);
      setShowForm(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo crear la clase");
      console.error(error);
    }
  };

  const handleUpdateClass = async (data: any) => {
    try {
      await api(`/classes/${editingClass.id_clase}`, {
        method: "PUT",
        data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      Alert.alert("Éxito", "Clase actualizada");
      fetchClasses(authToken!);
      setEditingClass(null);
      setShowForm(false);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la clase");
      console.error(error);
    }
  };

  const handleDeleteClass = async (id: number) => {
    Alert.alert("Confirmar", "¿Eliminar esta clase?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await api(`/classes/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${authToken}` },
            });
            Alert.alert("Eliminada", "Clase eliminada correctamente");
            fetchClasses(authToken!);
          } catch {
            Alert.alert("Error", "No se pudo eliminar la clase");
          }
        },
      },
    ]);
  };

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Fecha no válida";
    }
  };

  if (loading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );

  if (!userData || !authToken)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, textAlign: "center", color: "#444" }}>
          Debes iniciar sesión para ver las clases disponibles.
        </Text>
      </View>
    );

  const tipoRol = userData.tipo_rol?.toLowerCase();
  const isClient = tipoRol === "cliente";
  const canManage =
    tipoRol === "entrenador" ||
    tipoRol === "admin" ||
    tipoRol === "administrador";

  if (showForm) {
    return (
      <ScrollView style={{ padding: 18, backgroundColor: "#f3f4f6" }}>
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#6D28D9",
            marginBottom: 16,
          }}
        >
          {editingClass ? "Editar Clase" : "Crear Nueva Clase"}
        </Text>
        <ClassForm
          initialData={editingClass}
          onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
          onCancel={() => {
            setShowForm(false);
            setEditingClass(null);
          }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ padding: 18, backgroundColor: "#f3f4f6" }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 2,
        }}
      >
        <Text
          style={{
            marginVertical: 20,
            fontSize: 22,
            fontWeight: "bold",
            color: "#6D28D9",
          }}
        >
          {isClient ? "Clases Disponibles" : "Gestión de Clases"}
        </Text>

        {canManage && (
          <TouchableOpacity
            style={{
              marginVertical: 16,
            }}
            onPress={() => setShowForm(true)}
          >
            <Text
              style={{
                color: "#6D28D9",
                textAlign: "center",
                fontWeight: "bold",
                fontSize: 26,
                marginRight: 2,
              }}
            >
              ＋
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {classes
        .filter((c) => {
          if (isClient) {
            return !reservations.some(
              (r) => r.id_clase === c.id_clase && r.estado === "reservado"
            );
          }
          return true;
        })
        .map((c) => (
          <ClassCard
            key={c.id_clase}
            classItem={c}
            isClient={isClient}
            canManage={canManage}
            userReservations={reservations}
            onReserve={reserveClass}
            onCancelReservation={cancelReservation}
            onEdit={(cls) => {
              setEditingClass(cls);
              setShowForm(true);
            }}
            onDelete={handleDeleteClass}
            formatDate={formatDate}
          />
        ))}

      {isClient && (
        <>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              marginTop: 24,
              marginBottom: 8,
              color: "#6D28D9",
            }}
          >
            Mis Reservas
          </Text>
          {reservations
            .filter((r) => r.estado === "reservado")
            .map((r) => (
              <ReservationCard
                key={r.id}
                reservation={r}
                formatDate={formatDate}
                onCancelReservation={cancelReservation}
              />
            ))}
        </>
      )}
    </ScrollView>
  );
};

export default ClassesScreen;
