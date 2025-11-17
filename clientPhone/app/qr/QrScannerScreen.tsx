import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/utils/api";
import { requireAuth } from "@/src/utils/authGuard";
import { useFocusEffect } from "expo-router";
import { showError, showSuccess } from "@/src/utils/toast";

export default function QrScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      requireAuth();
    }, [])
  );

  const handleBarCodeScanned = async ({
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);

    try {
      const result = await api("/attendance/mark", {
        method: "POST",
        data: { qr_code: data },
      });

      if (result.success) {
        if (result.already_registered) {
          showSuccess(result.message, "Ya estás registrado");
        } else {
          showSuccess(result.message, "Asistencia registrada");
        }
        setTimeout(() => {
          setScanned(false);
          setLoading(false);
        }, 1500);
        // Alert.alert(
        //   result.already_registered
        //     ? "✅ Ya estás Registrado"
        //     : "✅ Asistencia Registrada",
        //   result.message,
        //   [
        //     {
        //       text: "OK",
        //       onPress: () => {
        //         setScanned(false);
        //         setLoading(false);
        //       },
        //     },
        //   ]
        // );
      } else {
        showError(result.message, "Error");
        setTimeout(() => {
          setScanned(false);
          setLoading(false);
        }, 1500);
        // Alert.alert("❌ Error", result.message, [
        //   {
        //     text: "Reintentar",
        //     onPress: () => {
        //       setScanned(false);
        //       setLoading(false);
        //     },
        //   },
        // ]);
      }
    } catch (error: any) {
      console.error("Error al verificar QR:", error);

      const errorMessage =
        error?.message || error?.error || "No se pudo conectar con el servidor";

      showError(errorMessage, "Error");
      setTimeout(() => {
        setScanned(false);
        setLoading(false);
      }, 1500);

      // Alert.alert("Error", errorMessage, [
      //   {
      //     text: "Reintentar",
      //     onPress: () => {
      //       setScanned(false);
      //       setLoading(false);
      //     },
      //   },
      // ]);
    }
  };

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (!result.granted) {
      Alert.alert(
        "Permiso Denegado",
        "Necesitas habilitar el acceso a la cámara en la configuración de tu dispositivo.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Abrir Configuración",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Solicitando permiso de cámara...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={80} color="#ef4444" />
        <Text style={styles.message}>No tienes acceso a la cámara</Text>
        <Text style={styles.description}>
          Para escanear códigos QR, necesitas permitir el acceso a la cámara.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={handleRequestPermission}
        >
          <Text style={styles.buttonText}>Solicitar Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Escanear Código QR</Text>
        <TouchableOpacity
          style={styles.flashButton}
          onPress={() => setFlashOn(!flashOn)}
        >
          <Ionicons
            name={flashOn ? "flash" : "flash-off"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.scannerContainer}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          enableTorch={flashOn}
        />

        {/* Marco de enfoque */}
        <View style={styles.overlay}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.middleContainer}>
            <View style={styles.unfocusedContainer}></View>
            <View style={styles.focusedContainer}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            <View style={styles.unfocusedContainer}></View>
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.instruction}>
          {loading
            ? "Registrando asistencia..."
            : scanned
            ? "Código escaneado exitosamente"
            : "Apunta la cámara hacia el código QR del gimnasio"}
        </Text>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#f97316"
            style={{ marginTop: 10 }}
          />
        )}
        {scanned && !loading && (
          <TouchableOpacity
            style={styles.scanAgainButton}
            onPress={() => {
              setScanned(false);
              setLoading(false);
            }}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.scanAgainText}>Escanear otro código</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 20,
    //  paddingTop: 20,
    // paddingBottom: 20,
    backgroundColor: "#1f2937",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  flashButton: {
    padding: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 8,
  },
  scannerContainer: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  middleContainer: {
    flexDirection: "row",
    flex: 1.5,
  },
  focusedContainer: {
    flex: 6,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "#f97316",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: "#1f2937",
    width: "100%",
    alignItems: "center",
  },
  instruction: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  scanAgainButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  scanAgainText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  message: {
    fontSize: 18,
    color: "white",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: "#9ca3af",
    textAlign: "center",
    marginHorizontal: 40,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#f97316",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
