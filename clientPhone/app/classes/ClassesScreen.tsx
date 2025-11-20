import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
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

import { useMembership } from "@/hooks/useMembership";
import { canSeeClasses } from "@/src/utils/membershipAccess";

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

  const { membership, loading: membershipLoading } = useMembership();

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
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async (token: string) => {
    try {
      const access = canSeeClasses(userData?.id_rol, membership);
      if (!access.allowed) return; // evitar error 403

      const response = await api("/reservations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservations(response);
    } catch (error) {
      // NO mostrar error si es 403
      if (error.response?.status !== 403) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (!membership || !userData || !authToken) return;

    const access = canSeeClasses(userData.id_rol, membership);

    if (access.allowed) {
      fetchClasses(authToken);
      fetchReservations(authToken); // <-- SOLO si tiene permiso
    } else {
      setClasses([]);
      setReservations([]); // IMPORTANTE: vaciar para evitar renders
      setLoading(false);
    }
  }, [membership, userData, authToken]);

  // ================================
  //  ACCIONES
  // ================================
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
        } finally {
          setConfirmConfig((p) => ({ ...p, visible: false }));
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
        } finally {
          setConfirmConfig((p) => ({ ...p, visible: false }));
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
      fetchClasses(authToken!);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo crear la clase", "Error");
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
      fetchClasses(authToken!);
      setEditingClass(null);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo actualizar la clase", "Error");
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
          setConfirmConfig((p) => ({ ...p, visible: false }));
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

  // ================================
  //   CARGAS
  // ================================
  if (membershipLoading) {
    return <ActivityIndicator size="large" />;
  }

  if (loading || membershipLoading)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );

  // ================================
  //  VALIDAR ACCESO SEGÚN MEMBRESÍA
  // ================================
  const access =
    userData && membership
      ? canSeeClasses(userData.id_rol, membership)
      : { allowed: false };

  if (!access.allowed) {
    let message = "No tienes acceso a clases.";

    if (access.reason === "sin_membresia") {
      message =
        "No tienes una membresía activa. Suscríbete para ver las clases.";
    } else if (access.reason === "tipo_invalido") {
      message =
        "Tu plan actual no incluye acceso a clases. Mejora tu membresía.";
    }

    return (
      <View
        style={{
          flex: 1,
          padding: 30,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#6D28D9",
            marginBottom: 10,
          }}
        >
          Acceso restringido
        </Text>
        <Text style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
          {message}
        </Text>
      </View>
    );
  }

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
            <TouchableOpacity onPress={() => setShowForm(true)}>
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

        {classes.map((c) => (
          <ClassCard
            key={c.id_clase}
            classItem={c}
            isClient={isClient}
            canManage={canManage}
            userReservations={reservations} // Aquí dentro sabrás si está reservada
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

        {isClient && access.allowed && (
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
