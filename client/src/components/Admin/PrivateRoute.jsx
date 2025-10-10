import { Navigate } from "react-router-dom";

export default function RutaPrivada({ children, rolPermitido }) {
  const user = JSON.parse(sessionStorage.getItem("userData"));

  if (!user || !user.isLoggedIn) return <Navigate to="/login" />; // No logueado
  if (rolPermitido && user.userData.id_rol !== 1) return <Navigate to="/" />; // Solo admin
  return children;
}
