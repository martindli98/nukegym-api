import React, { useState } from "react";
import nukegymLogo from "../../nukegymlogo.jpeg";
import ProfileEdit from "./ProfileEdit";
import axios from "axios";
import { toast } from "react-toastify";

export default function ProfileCard({ userData, onProfileUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const handleSaveProfile = async (formData) => {
    try {
      setUpdateLoading(true);

      const token =
        localStorage.getItem("token") || sessionStorage.getItem("authToken");

      if (!token) {
        toast.error("No hay token de autenticación");
        return;
      }

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

        if (onProfileUpdate) onProfileUpdate();
      } else {
        toast.error(response.data.message || "Error al actualizar perfil");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error al actualizar perfil"
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No especificado";
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime())
        ? "Fecha inválida"
        : date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
    } catch {
      return "Fecha inválida";
    }
  };

  const displayValue = (value, placeholder = "No especificado") => {
    const stringValue = String(value || "").trim();
    return stringValue && stringValue !== "null" ? stringValue : placeholder;
  };

  /* ---------------------- MODO EDICIÓN ---------------------- */
  if (isEditing) {
    return (
      <section className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <li>
                <a href="/" className="text-orange-600 hover:text-orange-700 dark:text-orange-400">
                  Home
                </a>
              </li>
              <li>›</li>
              <li className="font-medium">Mi Cuenta</li>
              <li>›</li>
              <li className="font-medium">Editar Perfil</li>
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

  /* ---------------------- VISTA NORMAL ---------------------- */
  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-900 py-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4">

        {/* Breadcrumb */}
        <nav className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
            <li>
              <a
                href="/"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400"
              >
                Home
              </a>
            </li>
            <li>›</li>
            <li className="font-medium">Mi Cuenta</li>
          </ol>
        </nav>

        {/* GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT CARD */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-20"></div>

            <div className="p-6 -mt-10">
              <div className="flex flex-col items-center">

                <img
                  src={userData?.foto_avatar || nukegymLogo}
                  alt="avatar"
                  className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                />

                <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-gray-100 text-center">
                  {displayValue(`${userData?.nombre || ""} ${userData?.apellido || ""}`)}
                </h2>

                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Miembro de NukeGym
                </p>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition-all active:scale-95"
                >
                  Editar
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="xl:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">

              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 border-b-2 border-orange-500 pb-3">
                Información Personal
              </h3>

              <div className="space-y-4">

                {/* Campo */}
                <Item label="Nombre Completo" value={displayValue(`${userData?.nombre} ${userData?.apellido}`)} />

                <Item label="Email" value={displayValue(userData?.email)} />

                <Item label="DNI" value={displayValue(userData?.nro_documento)} />

                <Item label="Teléfono Personal" value={displayValue(userData?.num_personal)} />

                <Item label="Teléfono de Emergencia" value={displayValue(userData?.num_emergencia)} />

                <Item label="Fecha de Nacimiento" value={formatDate(userData?.fechaNac)} />

                {userData?.patologias && (
                  <Item label="Patologías" value={displayValue(userData.patologias)} />
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ---- Componente de Item reutilizable (con soporte dark) ---- */
function Item({ label, value }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {label}
      </span>
      <span className="md:col-span-2 text-gray-700 dark:text-gray-300 break-words">
        {value}
      </span>
    </div>
  );
}
