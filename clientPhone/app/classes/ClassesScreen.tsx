import React, { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useColorScheme,
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
  const [membership, setMembership] = useState<any>(null);
  const [loadingMembership, setLoadingMembership] = useState(true);

  const theme = useColorScheme();
  const isDark = theme === "dark";

  const [classDetails, setClassDetails] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          // Resetear estado antes de cargar
          setClasses([]);
          setReservations([]);
          setUserData(null);
          setAuthToken(null);
          setMembership(null);
          setLoading(true);
          setLoadingMembership(true);

          const storedUser = await AsyncStorage.getItem("userData");
          const storedToken = await AsyncStorage.getItem("authToken");

          if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUserData(parsedUser);
            setAuthToken(storedToken);

            // Cargar membresía
            const role = parsedUser.id_rol;

            if (role === 1 || role === 3) {
              setMembership({
                membershipActive: true,
                data: { tipo: "libre" },
              });
            } else {
              try {
                const res = await api("/membership/status");
                setMembership(res);
              } catch (err) {
                console.error("Error membership:", err);
                setMembership({ membershipActive: false });
              }
            }
            setLoadingMembership(false);
          } else {
            setUserData(null);
            setAuthToken(null);
            setMembership({ membershipActive: false, data: {} });
            setLoadingMembership(false);
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
          setLoadingMembership(false);
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const getClassDetails = async (classItem) => {
      setClassDetails(classItem);
      try {
        const students = await api(`/classes/studentsClass/${classItem.id_clase}`);
      
        setClassStudents(students);
        console.log(students)
        setShowDetailsModal(true); 
      } catch (error) {
        toast.error("Error al cargar los alumnos de esta clase");
        console.error(error);
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

  // 🔥 🔥 LÓGICA DE MEMBRESÍA EXACTA A LA DEL WEB
  const canViewClasses = () => {
    if (!userData || !membership) return false;

    const rol = userData.tipo_rol?.toLowerCase();
    const tipo = membership?.data?.tipo;
    const active = membership?.membershipActive;

    // Admin o entrenador pueden ver todo
    if (rol === "admin" || rol === "administrador" || rol === "entrenador")
      return true;

    // Cliente
    if (rol === "cliente") {
      if (active && (tipo === 2 || tipo === 3)) return true;
      return false;
    }

    return false;
  };

  const canViewReservations = () => {
    const rol = userData?.tipo_rol?.toLowerCase();
    const tipo = membership?.data?.tipo;
    const active = membership?.membershipActive;

    return rol === "cliente" && active && (tipo === 2 || tipo === 3);
  };

  // 🔥 SOLO CARGA DATOS SI LA MEMBRESÍA LO PERMITE
  useEffect(() => {
    if (!userData || !authToken || loadingMembership) return;

    if (canViewClasses()) {
      fetchClasses(authToken);
    } else {
      setClasses([]);
    }

    if (canViewReservations()) {
      fetchReservations(authToken);
    } else {
      setReservations([]);
    }
  }, [userData, authToken, membership]);

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
      fetchClasses(authToken!);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo crear la clase", "Error");
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
      fetchClasses(authToken!);
      setEditingClass(null);
      setShowForm(false);
    } catch (error) {
      showError("No se pudo actualizar la clase", "Error");
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

  if (loading || loadingMembership)
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );

  const tipoRol = userData?.tipo_rol?.toLowerCase() || "";
  const isClient = tipoRol === "cliente";

  const canManage =
    tipoRol === "entrenador" ||
    tipoRol === "admin" ||
    tipoRol === "administrador";

  // 🔥 SI ES CLIENTE Y NO PUEDE VER NADA → MOSTRAR MENSAJE
  if (isClient && !canViewClasses()) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
          backgroundColor: isDark ? "#111827" : "#f3f4f6",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: "bold",
            color: "#f97316",
            marginBottom: 10,
          }}
        >
          Membresía insuficiente
        </Text>

        <Text style={{ textAlign: "center", fontSize: 16, color: "#6b7280" }}>
          Tu plan no permite ver ni reservar clases.  
          Actualizá tu membresía para acceder.
        </Text>
      </View>
    );
  }

  if (showForm) {
    return (
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        style={{ padding: 18, backgroundColor: isDark ? "#111827" : "#f3f4f6" }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            color: "#f97316",
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


  {/* ---------- MODAL DETALLES DE CLASE ---------- */}
if(showDetailsModal){
  return(
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      zIndex: 999,
    }}
  >
    <View
      style={{
        width: "100%",
        maxWidth: 380,
        backgroundColor: isDark ? "#1f2937" : "white",
        padding: 20,
        borderRadius: 16,
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#f97316",
          marginBottom: 10,
        }}
      >
        {classDetails?.nombre}
      </Text>

      <Text
        style={{
          color: isDark ? "#d1d5db" : "#4b5563",
          marginBottom: 6,
        }}
      >
        🕒 {formatDate(classDetails?.horario)}
      </Text>

      <Text
        style={{
          color: isDark ? "#d1d5db" : "#4b5563",
          marginBottom: 6,
        }}
      >
        🏋️ Entrenador:{" "}
        {classDetails?.entrenador_nombre || "Sin entrenador"}
      </Text>

      <Text
        style={{
          color: isDark ? "#d1d5db" : "#4b5563",
          marginBottom: 6,
        }}
      >
        👥 Cupo máximo: {classDetails?.cupo_maximo}
      </Text>

      <Text
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: "bold",
          color: isDark ? "white" : "black",
        }}
      >
        Alumnos inscriptos:
      </Text>

      {classStudents.length === 0 ? (
        <Text style={{ color: "#6b7280", marginTop: 6 }}>
          No hay alumnos reservados.
        </Text>
      ) : (
        classStudents.map((al) => (
          <Text
            key={al.id_reserva}
            style={{ color: isDark ? "#d1d5db" : "#4b5563", marginTop: 4 }}
          >
            • {al.nombre} {al.apellido}
          </Text>
        ))
      )}

      {/* BOTÓN CERRAR */}
      <TouchableOpacity
        onPress={() => setShowDetailsModal(false)}
        style={{
          marginTop: 20,
          backgroundColor: "#f97316",
          paddingVertical: 12,
          borderRadius: 10,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Cerrar
        </Text>
      </TouchableOpacity>
    </View>
  </View>)
}

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: isDark ? "#111827" : "#f3f4f6",
        }}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: 10,
          paddingBottom: 50,
        }}
      >
        {/* ---------- TÍTULO + BOTÓN ---------- */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            marginTop: 4,
          }}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#111827",
              letterSpacing: 0.3,
            }}
          >
            {isClient ? "Clases disponibles" : "Gestión de clases"}
          </Text>

          {canManage && (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              style={{
                backgroundColor: "#f97316",
                width: 38,
                height: 38,
                borderRadius: 12,
                justifyContent: "center",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontSize: 26,
                  fontWeight: "bold",
                  marginTop: -3,
                }}
              >
                +
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ---------- LISTA DE CLASES ---------- */}
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
            <View key={c.id_clase} style={{ marginBottom: 14 }}>
              <ClassCard
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
                  onViewDetails={getClassDetails}   // <-- AÑADÍ ESTO
                />

            </View>
          ))}

        <View
          style={{
            height: 1.5,
            width: "100%",
            backgroundColor: isDark ? "#374151" : "#d1d5db",
            marginVertical: 18,
            borderRadius: 20,
          }}
        />

        {/* ---------- SECCIÓN DE RESERVAS ---------- */}
        {isClient && (
          <>
            <Text
              style={{
                marginTop: 28,
                marginBottom: 14,
                fontSize: 24,
                fontWeight: "800",
                color: "#f97316",
              }}
            >
              Mis Reservas
            </Text>

            {reservations
              .filter((r) => r.estado === "reservado")
              .map((r) => (
                <View key={r.id} style={{ marginBottom: 14 }}>
                  <ReservationCard
                      reservation={r}
                      formatDate={formatDate}
                      onCancelReservation={cancelReservation}
                      onViewDetails={getClassDetails}
                    />
                </View>
              ))}
          </>
        )}
      </ScrollView>

      {/* ---------- MODAL ---------- */}
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
