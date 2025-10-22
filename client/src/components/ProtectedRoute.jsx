import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, rolPermitido }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  const checkAuthStatus = () => {
    try {
      setLoading(true);

      // Leer token y datos de usuario directamente desde sessionStorage
      const token = sessionStorage.getItem("authToken");
      const userData = JSON.parse(sessionStorage.getItem("userData") || "null");

      const authenticated = !!(token && userData && userData.isLoggedIn);
      setIsAuthenticated(authenticated);

      // Limpiar datos si no está autenticado
      if (!authenticated) {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userData");
        console.log("ProtectedRoute - sesión eliminada");
      }

      // Si rolPermitido está definido, verificar que el usuario tenga el rol correcto
      if (authenticated && rolPermitido) {
        const userRol = userData?.userData?.rol || userData?.userData?.id_rol;

        // Soportar array de roles o rol único
        const rolesPermitidos = Array.isArray(rolPermitido)
          ? rolPermitido
          : [rolPermitido];

        // Verificar si el usuario tiene alguno de los roles permitidos
        let tienePermiso = false;

        for (const rol of rolesPermitidos) {
          if (rol === "admin" && userData.userData.id_rol === 1) {
            tienePermiso = true;
            break;
          }
          if (rol === "cliente" && userData.userData.id_rol === 2) {
            tienePermiso = true;
            break;
          }
          if (rol === "entrenador" && userData.userData.id_rol === 3) {
            tienePermiso = true;
            break;
          }
        }

        if (!tienePermiso) {
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.error("ProtectedRoute - Error al verificar auth:", error);
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

  // Si no está autenticado o no tiene rol correcto
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Usuario autenticado y rol correcto → renderiza componente
  return children;
};

export default ProtectedRoute;
