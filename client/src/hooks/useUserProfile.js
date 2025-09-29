import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const useUserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar el token en ambos lugares para compatibilidad
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      if (!token) {
        throw new Error("No hay token de autenticación. Debes iniciar sesión.");
      }

      console.log("Token encontrado:", token ? "Sí" : "No");

      const response = await axios.get(
        "http://localhost:3000/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);

      if (response.data.success) {
        setUserData(response.data.user);
        setError(null);
      } else {
        throw new Error(response.data.message || "Error al obtener perfil");
      }
    } catch (err) {
      console.error(" Error fetching user profile:", err);
      setError(err.message);

      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token inválido, limpiar storage
        localStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");

        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
      } else if (err.message.includes("No hay token")) {
        // No hay token
        toast.error("Debes iniciar sesión para ver tu perfil");
        setError("Debes iniciar sesión para ver tu perfil");
      } else {
        toast.error("Error al cargar el perfil del usuario");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return {
    userData,
    loading,
    error,
    refetch: fetchUserProfile,
  };
};

export default useUserProfile;
