import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]); // Re-check cuando cambia la ruta

  const checkAuthStatus = () => {
    try {
      setLoading(true);

      // Verificar si hay token en cualquiera de las ubicaciones
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");
      const userData = JSON.parse(sessionStorage.getItem("userData") || "null");

      console.log("ProtectedRoute - Token:", !!token);
      console.log("ProtectedRoute - UserData:", userData);

      // Usuario autenticado si tiene token Y datos de usuario
      const authenticated = !!(token && userData && userData.isLoggedIn);

      setIsAuthenticated(authenticated);

      if (!authenticated) {
        // Limpiar cualquier residuo de sesión
        localStorage.removeItem("token");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        console.log("ProtectedRoute - Limpiando datos de sesión");
      }
    } catch (error) {
      console.error("ProtectedRoute - Error checking auth:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras verifica
  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div className="text-xl text-gray-600">Verificando sesión...</div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si está autenticado, mostrar el componente protegido
  return children;
};

export default ProtectedRoute;
