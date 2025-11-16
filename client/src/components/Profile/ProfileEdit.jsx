import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function ProfileEdit({ userData, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    nro_documento: "",
    num_personal: "",
    num_emergencia: "",
    fechaNac: "",
    patologias: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        nombre: String(userData.nombre || ""),
        apellido: String(userData.apellido || ""),
        email: String(userData.email || ""),
        nro_documento: String(userData.nro_documento || ""),
        num_personal: String(userData.num_personal || ""),
        num_emergencia: String(userData.num_emergencia || ""),
        fechaNac: userData.fechaNac ? userData.fechaNac.split("T")[0] : "",
        patologias: String(userData.patologias || ""),
      });
    }
  }, [userData]);

  const validateForm = () => {
    const newErrors = {};
    const nombre = String(formData.nombre || "").trim();
    if (!nombre) newErrors.nombre = "El nombre es obligatorio";

    const apellido = String(formData.apellido || "").trim();
    if (!apellido) newErrors.apellido = "El apellido es obligatorio";

    const email = String(formData.email || "").trim();
    if (!email) newErrors.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Formato de email inválido";

    const nro_documento = String(formData.nro_documento || "").trim();
    if (!nro_documento) newErrors.nro_documento = "El DNI es obligatorio";
    else if (!/^\d{8}$/.test(nro_documento)) newErrors.nro_documento = "El DNI debe tener 8 dígitos";

    const num_personal = String(formData.num_personal || "").trim();
    if (num_personal && !/^\d+$/.test(num_personal))
      newErrors.num_personal = "Debe contener solo números";

    const num_emergencia = String(formData.num_emergencia || "").trim();
    if (num_emergencia && !/^\d+$/.test(num_emergencia))
      newErrors.num_emergencia = "Debe contener solo números";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: String(value || ""),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) onSave(formData);
    else toast.error("Por favor corrige los errores en el formulario");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8 transition-colors duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 border-b-2 border-orange-500 pb-1">
          Editar Información Personal
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Nombres */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Nombre */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ingrese su nombre"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.nombre ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.nombre}</p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              placeholder="Ingrese su apellido"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.apellido ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.apellido && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.apellido}</p>
            )}
          </div>
        </div>

        {/* Email y DNI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.email ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.email}</p>
            )}
          </div>

          {/* DNI */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              DNI *
            </label>
            <input
              type="text"
              name="nro_documento"
              maxLength="8"
              value={formData.nro_documento}
              onChange={handleInputChange}
              placeholder="12345678"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.nro_documento ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.nro_documento && (
              <p className="text-red-500 text-xs sm:text-sm">
                {errors.nro_documento}
              </p>
            )}
          </div>
        </div>

        {/* Teléfonos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Personal */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Teléfono Personal
            </label>
            <input
              type="text"
              name="num_personal"
              value={formData.num_personal}
              onChange={handleInputChange}
              placeholder="2991234567"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.num_personal ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.num_personal && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.num_personal}</p>
            )}
          </div>

          {/* Emergencia */}
          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              Teléfono de Emergencia
            </label>
            <input
              type="text"
              name="num_emergencia"
              value={formData.num_emergencia}
              onChange={handleInputChange}
              placeholder="2981234567"
              className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors 
              bg-white dark:bg-gray-700 
              text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-300
              focus:outline-none focus:ring-2 focus:ring-orange-500 
              ${
                errors.num_emergencia ? "border-red-500" : "border-gray-300 dark:border-gray-600"
              }`}
            />
            {errors.num_emergencia && (
              <p className="text-red-500 text-xs sm:text-sm">{errors.num_emergencia}</p>
            )}
          </div>
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fechaNac"
            value={formData.fechaNac}
            onChange={handleInputChange}
            className="w-full sm:max-w-md px-4 py-3 text-sm sm:text-base border 
            bg-white dark:bg-gray-700 
            text-gray-900 dark:text-gray-100 
            border-gray-300 dark:border-gray-600 
            rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Patologías */}
        <div className="space-y-2">
          <label className="block text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
            Patologías
          </label>
          <textarea
            name="patologias"
            rows="3"
            value={formData.patologias}
            onChange={handleInputChange}
            placeholder="Describa cualquier condición médica relevante..."
            className="w-full px-4 py-3 text-sm sm:text-base border 
            bg-white dark:bg-gray-700 
            text-gray-900 dark:text-gray-100 
            placeholder-gray-400 dark:placeholder-gray-300
            border-gray-300 dark:border-gray-600 
            rounded-lg focus:ring-2 focus:ring-orange-500 resize-vertical"
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 ${
              loading ? "opacity-50 cursor-not-allowed" : "active:scale-95"
            }`}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all duration-200 active:scale-95"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
