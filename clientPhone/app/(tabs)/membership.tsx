import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  useColorScheme
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { Picker } from "@react-native-picker/picker";
import * as WebBrowser from "expo-web-browser";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { requireAuth } from "@/src/utils/authGuard";

const activaImg = require("../../assets/membership/activa.png");
const bajaImg = require("../../assets/membership/baja.png");
const expiradaImg = require("../../assets/membership/expiro.png");

interface MembershipData {
  tipo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
}

export default function Membership() {
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<boolean | null>(
    null
  );
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const theme = useColorScheme();
  const isDark = theme === "dark";

  useFocusEffect(
    useCallback(() => {
      const fetchMembership = async () => {
        requireAuth();
        
        // Resetear estado antes de cargar
        setMembership(null);
        setMembershipStatus(null);
        setSelectedPlan(null);
        setLoading(true);
        setError("");

        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
          setError("Debes iniciar sesión para ver tu membresía.");
          setMembership(null);
          setMembershipStatus(null);
          setLoading(false);
          return;
        }

        try {
          const [membershipRes, plansRes] = await Promise.all([
            api("/membership/status"),
            api("/membership/plans"),
          ]);

          if (membershipRes.success) {
            setMembership(membershipRes.data);
            setMembershipStatus(membershipRes.membershipActive);
            setError("");
          } else {
            setMembership(null);
            setMembershipStatus(false);
            setError("No tienes una membresía activa.");
          }

          if (plansRes.success) {
            setPlans(plansRes.plansList);
          }
        } catch (err: any) {
          console.error("Error al obtener membresía o planes", err);
          if (err.response?.status === 401) {
            setError("Tu sesión ha expirado. Iniciá sesión nuevamente.");
            await AsyncStorage.removeItem("authToken");
          } else {
            setError("Error al obtener la membresía o planes.");
          }
        } finally {
          setLoading(false);
        }
      };

      fetchMembership();
    }, [])
  );

  const handleBuy = async () => {
    const token = await AsyncStorage.getItem("authToken");
    const session = await AsyncStorage.getItem("userData");

    if (!token || !session) {
      Alert.alert("Error", "Debes iniciar sesión para comprar una membresía.");
      return;
    }

    const user = JSON.parse(session);

    if (!selectedPlan) {
      Alert.alert(
        "Seleccioná un plan",
        "Debes elegir un plan antes de continuar."
      );
      return;
    }

    try {
      const res = await api("/payments/create_preference", {
        method: "POST",
        body: JSON.stringify({
          title: "Renovación de Membresía",
          quantity: 1,
          price: selectedPlan.precio,
          userId: user.id,
          tipo_plan: selectedPlan.id,
        }),
      });

      const preferenceId = res.preferenceId;
      if (!preferenceId) {
        Alert.alert("Error", "No se pudo obtener la preferencia de pago.");
        return;
      }

      const mpUrl = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${preferenceId}`;
      const result = await WebBrowser.openBrowserAsync(mpUrl);

      if (result.type === "dismiss" || result.type === "cancel") {
        Alert.alert("Info", "Verificando el estado del pago...");
        await refreshMembership();
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo crear la preferencia de pago.");
    }
  };

  const refreshMembership = async () => {
    try {
      const res = await api("/membership/status");

      if (res.success) {
        setMembership(res.data);
        setMembershipStatus(res.membershipActive);
      }
    } catch (err) {
      console.error("Error al refrescar membresía", err);
    }
  };

 const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: isDark ? "#0f172a" : "#f9fafb",
    padding: 20,
    paddingTop: 30,
  },

  text: {
    marginTop: 10,
    fontSize: 16,
    color: isDark ? "#ffffff" : "#1e293b",
  },

  cardContainer: {
    width: "100%",
    alignItems: "center",
  },

  card: {
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: isDark ? "#ffffff" : "#1e293b",
    textAlign: "center",
  },

  cardImage: {
    width: 110,
    height: 110,
    marginVertical: 15,
  },

  cardDesc: {
    textAlign: "center",
    color: isDark ? "#d1d5db" : "#6b7280",
    marginTop: 6,
    fontSize: 15,
  },

  label: {
    fontSize: 15,
    color: isDark ? "#ffffff" : "#1e293b",
    fontWeight: "600",
    marginBottom: 8,
  },

  pickerContainer: {
    borderWidth: 1.5,
    borderColor: isDark ? "#334155" : "#d1d5db",
    borderRadius: 12,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    marginBottom: 15,
    overflow: "hidden",
  },

  button: {
    backgroundColor: "#fa7808",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
    shadowColor: "#fa7808",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 17,
  },

  infoCard: {
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    marginTop: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },

  infoTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f97316",
    marginBottom: 18,
    textAlign: "center",
  },

  infoText: {
    fontSize: 16,
    color: isDark ? "#ffffff" : "#1e293b",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 4,
  },

  infoIcon: {
    marginRight: 10,
  },
});


  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fa7808" />
        <Text style={styles.text}>Cargando membresía...</Text>
      </View>
    );
  }

  const renderCard = () => {
    if (error)
      return (
        <MembershipCard
          title={error}
          img={bajaImg}
          descripcion="Ocurrió un error"
        />
      );

    if (membershipStatus === true)
      return (
        <MembershipCard
          title="✅ Tu membresía está activa"
          img={activaImg}
          descripcion="Disfrutá tu entrenamiento"
        />
      );

    if (membership?.estado === "baja")
      return <MembershipCard title="⚠️ Membresía dada de baja" img={bajaImg} />;

    return (
      <View style={styles.cardContainer}>
        <MembershipCard
          title="❌ Tu membresía expiró"
          descripcion="Adquirí un nuevo plan para seguir entrenando 🏋️‍♂️"
          img={expiradaImg}
        />

        <View style={{ width: "100%", marginTop: 15 }}>
          <Text style={styles.label}>Seleccioná un plan:</Text>
          <View style={styles.pickerContainer}>
            <Picker
                style={{ color: isDark ? "#ffffff" : "#111827" }}
                selectedValue={selectedPlan?.id || ""}
                onValueChange={(value: any) => {
                  const plan = plans.find((p) => p.id === value);
                  setSelectedPlan(plan || null);
                }}
              >
                <Picker.Item label="Seleccioná un plan" value="" color={isDark ? "#ffffff88" : "#888"} />
                {plans.map((plan) => (
                  <Picker.Item
                    key={plan.id}
                    label={`${plan.nombre} — $${plan.precio}`}
                    value={plan.id}
                    color="#111827"
                    
                  />
                ))}
              </Picker>

          </View>

          <TouchableOpacity
            style={[
              styles.button,
              !selectedPlan && { backgroundColor: "#aaa" },
            ]}
            disabled={!selectedPlan}
            onPress={handleBuy}
          >
            <Text style={styles.buttonText}>
              {selectedPlan ? "Renovar Membresía" : "Seleccioná un plan"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  function MembershipCard({
  title,
  img,
  descripcion,
}: {
  title: string;
  img: any;
  descripcion?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Image source={img} style={styles.cardImage} resizeMode="contain" />
      {descripcion && <Text style={styles.cardDesc}>{descripcion}</Text>}
    </View>
  );
}

function InfoCard({
  estado,
  inicio,
  fin,
  tipo,
}: {
  estado: string;
  inicio: string;
  fin: string;
  tipo: string;
}) {
  const safeEstado = estado || "desconocido";

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTipoText = (tipo: string | number) => {
    switch (String(tipo)) {
      case "1":
        return "Una vez por semana";
      case "2":
        return "Tres veces por semana";
      case "3":
        return "Pase libre";
      default:
        return "Desconocido";
    }
  };

  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoTitle}>Detalles de tu membresía</Text>

      <View style={styles.infoRow}>
        <Ionicons
          name="information-circle-outline"
          size={20}
          color={safeEstado === "activo" ? "#2ecc71" : "#e74c3c"}
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>
          Estado:{" "}
          <Text
            style={{
              color: safeEstado === "activo" ? "#2ecc71" : "#e74c3c",
            }}
          >
            {safeEstado.charAt(0).toUpperCase() + safeEstado.slice(1)}
          </Text>
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#3498db"
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>Inicio: {formatDate(inicio)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#e67e22"
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>Fin: {formatDate(fin)}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="card-outline"
          size={20}
          color="#9b59b6"
          style={styles.infoIcon}
        />
        <Text style={styles.infoText}>Tipo: {getTipoText(tipo)}</Text>
      </View>
    </View>
  );
}


  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderCard()}

      {membership && (
        <InfoCard
          estado={membership.estado}
          inicio={membership.fechaInicio}
          fin={membership.fechaFin}
          tipo={membership.tipo}
        />
      )}

      {/* 📄 Si el usuario es admin */}
      {/* Podés validar el rol desde AsyncStorage */}
      {/* <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPDF}>
        <Text style={styles.pdfButtonText}>📄 Descargar listado de membresías</Text>
      </TouchableOpacity> */}
    </ScrollView>
  );
}
