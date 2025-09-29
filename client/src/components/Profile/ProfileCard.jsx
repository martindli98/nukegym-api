import React, { useState } from "react";
import nukegymLogo from "../../nukegymlogo.jpeg";
import ProfileEdit from "./ProfileEdit";
import axios from "axios";
import { toast } from "react-toastify";

export default function ProfileCard({ userData, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Función para guardar cambios
  const handleSaveProfile = async (formData) => {
    try {
      setUpdateLoading(true);

      // Obtener token de autenticación
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

      console.log("Actualizando perfil:", formData);

      // Realizar petición al backend
      const response = await axios.put(
        "http://localhost:3000/api/users/profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("¡Perfil actualizado correctamente!");
        setIsEditing(false);

        // Notificar al componente padre para refrescar los datos
        if (onProfileUpdate) {
          onProfileUpdate();
        }
      } else {
        toast.error(response.data.message || "Error al actualizar perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.message || "Error al actualizar perfil"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Si está en modo edición, mostrar el formulario
  if (isEditing) {
    return (
      <section className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <a
                  href="/"
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Home
                </a>
              </li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-700 font-medium">Mi Cuenta</li>
              <li className="text-gray-500">›</li>
              <li className="text-gray-700 font-medium">Editar Perfil</li>
            </ol>
          </nav>

          <div className="max-w-4xl mx-auto">
            <ProfileEdit
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
              loading={updateLoading}
            />
          </div>
        </div>
      </section>
    );
  }

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString || dateString === null || dateString === undefined) {
      return "No especificado";
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Fecha inválida";
      }
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Fecha inválida";
    }
  };

  // Función para mostrar texto o placeholder
  const displayValue = (value, placeholder = "No especificado") => {
    // Convertir a string y validar
    const stringValue = String(value || "").trim();
    return stringValue !== "" &&
      stringValue !== "null" &&
      stringValue !== "undefined"
      ? stringValue
      : placeholder;
  };

  return (
    <section className="min-h-screen bg-gray-100 py-3 sm:py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 md:px-6 lg:px-6 xl:px-8">
        {/* Breadcrumb Navigation - Responsive */}
        <nav className="bg-white rounded-lg shadow-sm p-2 xs:p-3 sm:p-4 mb-3 xs:mb-4 sm:mb-6">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
            <li>
              <a
                href="/"
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Home
              </a>
            </li>
            <li className="text-gray-500">›</li>
            <li className="text-gray-700 font-medium">Mi Cuenta</li>
          </ol>
        </nav>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 xs:gap-4 sm:gap-6">
          {/* Profile Card - Left Column */}
          <div className="xl:col-span-1 order-1 xl:order-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-3 xs:mb-4 sm:mb-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-12 xs:h-16 sm:h-20 lg:h-24"></div>
              <div className="px-3 xs:px-4 sm:px-6 pb-3 xs:pb-4 sm:pb-6 -mt-8 xs:-mt-10 sm:-mt-12 relative">
                <div className="flex flex-col items-center">
                  <img
                    src={userData?.foto_avatar || nukegymLogo}
                    alt="avatar"
                    className="w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  <h2 className="mt-2 xs:mt-3 sm:mt-4 text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900 text-center px-2">
                    {displayValue(
                      `${userData?.nombre || ""} ${
                        userData?.apellido || ""
                      }`.trim()
                    )}
                  </h2>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 xs:mb-4 sm:mb-6 text-center">
                    Miembro de NukeGym
                  </p>
                  <div className="flex space-x-3 w-full">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold py-2 xs:py-2.5 sm:py-2.5 px-3 xs:px-3 sm:px-4 rounded-lg transition-all duration-200 text-xs xs:text-sm sm:text-base hover:shadow-lg active:scale-95"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel - Right Column */}
          <div className="xl:col-span-2 order-2 xl:order-2">
            <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 mb-3 xs:mb-4 sm:mb-6">
              <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-3 xs:mb-4 sm:mb-6 border-b-2 border-orange-500 pb-2 sm:pb-3">
                Información Personal
              </h3>
              <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                {/* Nombre Completo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    Nombre Completo
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                    {displayValue(
                      `${userData?.nombre || ""} ${
                        userData?.apellido || ""
                      }`.trim()
                    )}
                  </span>
                </div>

                {/* Email */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    Email
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base break-words">
                    {displayValue(userData?.email)}
                  </span>
                </div>

                {/* DNI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    DNI
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                    {displayValue(userData?.nro_documento)}
                  </span>
                </div>

                {/* Teléfono Personal */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    Teléfono Personal
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                    {displayValue(userData?.num_personal)}
                  </span>
                </div>

                {/* Teléfono de Emergencia */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    Teléfono de Emergencia
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                    {displayValue(userData?.num_emergencia)}
                  </span>
                </div>

                {/* Fecha de Nacimiento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3 border-b border-gray-100">
                  <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                    Fecha de Nacimiento
                  </span>
                  <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                    {formatDate(userData?.fechaNac)}
                  </span>
                </div>

                {/* Patologías */}
                {userData?.patologias && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-1 xs:gap-2 sm:gap-4 py-2 xs:py-2 sm:py-3">
                    <span className="font-semibold text-gray-900 text-xs xs:text-sm sm:text-base">
                      Patologías
                    </span>
                    <span className="md:col-span-2 text-gray-700 text-xs xs:text-sm sm:text-base">
                      {displayValue(userData.patologias)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
