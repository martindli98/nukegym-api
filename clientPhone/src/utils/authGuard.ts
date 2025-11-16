import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { showError } from "@/src/utils/toast";

export const requireAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    const userData = await AsyncStorage.getItem("userData");

    if (!token || !userData) {
      showError("Debes iniciar sesión para acceder a esta sección.", "Iniciar sesión requerido");
      router.replace("/(tabs)/profile");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking auth:", error);
    router.replace("/(tabs)/profile");
    return false;
  }
};

export const getUserRole = async (): Promise<number | null> => {
  try {
    const userData = await AsyncStorage.getItem("userData");
    if (!userData) return null;

    const user = JSON.parse(userData);
    return user.id_rol;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};
