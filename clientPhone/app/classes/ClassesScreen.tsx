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
import { requireAuth } from "@/src/utils/authGuard";
import { showError, showSuccess } from "@/src/utils/toast";
import ConfirmModal from "@/components/confirm_modal/ConfirmModal";

const ClassesScreen: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

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
      showError("No se pudieron cargar las clases.", "Error");
      // Alert.alert("Error", "No se pudieron cargar las clases.");
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

  const reserveClass = (id: number) => {
    if (!authToken) return;

    setConfirmConfig({
      visible: true,
      title: "Reservar clase",
      message: "¿Deseas reservar esta clase?",
      onConfirm: async () => {
        try {
          await api("/reservations", {
            method: "POST",
            data: { id_clase: id },
            headers: { Authorization: `Bearer ${authToken}` },
          });

          showSuccess("Reserva realizada correctamente", "Éxito");

          fetchClasses(authToken);
          fetchReservations(authToken);
        } catch (error) {
          showError("No se pudo reservar la clase", "Error");
          console.error(error);
        } finally {
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  const cancelReservation = (id: number) => {
    if (!authToken) return;

    setConfirmConfig({
      visible: true,
      title: "Cancelar reserva",
      message: "¿Estás seguro que deseas cancelar esta reserva?",
      onConfirm: async () => {
        try {
          await api(`/reservations/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
          });

          showSuccess("Reserva cancelada", "Cancelada");

          fetchReservations(authToken);
        } catch (error) {
          showError("No se pudo cancelar la reserva", "Error");
          console.error(error);
        } finally {
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  const handleCreateClass = async (data: any) => {
    try {
      await api("/classes", {
        method: "POST",
        data,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      showSuccess("Clase creada correctamente", "Éxito");
      // Alert.alert("Éxito", "Clase creada correctamente");
      fetchClasses(authToken!);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo crear la clase", "Error");
      // Alert.alert("Error", "No se pudo crear la clase");
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
      showSuccess("Clase actualizada", "Éxito");
      // Alert.alert("Éxito", "Clase actualizada");
      fetchClasses(authToken!);
      setEditingClass(null);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo actualizar la clase", "Error");
      // Alert.alert("Error", "No se pudo actualizar la clase");
      console.error(error);
    }
  };

  const handleDeleteClass = (id: number) => {
    setConfirmConfig({
      visible: true,
      title: "Eliminar clase",
      message: "¿Seguro que deseas eliminar esta clase?",
      onConfirm: async () => {
        try {
          await api(`/classes/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${authToken}` },
          });

          showSuccess("Clase eliminada correctamente", "Eliminada");
          fetchClasses(authToken!);
        } catch (error) {
          showError("No se pudo eliminar la clase", "Error");
        } finally {
          setConfirmConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
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

  // if (!userData || !authToken)
  //   return (
  //     <View
  //       style={{
  //         flex: 1,
  //         justifyContent: "center",
  //         alignItems: "center",
  //         padding: 20,
  //       }}
  //     >
  //       <Text style={{ fontSize: 18, textAlign: "center", color: "#444" }}>
  //         Debes iniciar sesión para ver las clases disponibles.
  //       </Text>
  //     </View>
  //   );

  const tipoRol = userData?.tipo_rol?.toLowerCase() || "";
  const isClient = tipoRol === "cliente";
  const canManage =
    tipoRol === "entrenador" ||
    tipoRol === "admin" ||
    tipoRol === "administrador";

  if (showForm) {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ padding: 18, backgroundColor: "#f3f4f6" }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#6D28D9",
            marginBottom: 16,
          }}
        >
          {editingClass ? "Editar clase" : "Crear nueva clase"}
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
    <>
      <ScrollView
        style={{
          paddingHorizontal: 10,
          backgroundColor: "#f3f4f6",
          padding: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 2,
            // paddingVertical: 8,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "bold",
              color: "#6D28D9",
              paddingVertical: 5,
            }}
          >
            {isClient ? "Clases disponibles" : "Gestión de clases"}
          </Text>

          {canManage && (
            <TouchableOpacity
              style={
                {
                  // marginVertical: 2,
                }
              }
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
      <ConfirmModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() =>
          setConfirmConfig((prev) => ({ ...prev, visible: false }))
        }
      />
    </>
  );
};

export default ClassesScreen;
