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

  // Inicializar formulario con datos del usuario
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

  // Validaciones
  const validateForm = () => {
    const newErrors = {};

    // Convertir a string y validar nombre
    const nombre = String(formData.nombre || "").trim();
    if (!nombre) {
      newErrors.nombre = "El nombre es obligatorio";
    }

    // Convertir a string y validar apellido
    const apellido = String(formData.apellido || "").trim();
    if (!apellido) {
      newErrors.apellido = "El apellido es obligatorio";
    }

    // Convertir a string y validar email
    const email = String(formData.email || "").trim();
    if (!email) {
      newErrors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de email inválido";
    }

    // Convertir a string y validar DNI
    const nro_documento = String(formData.nro_documento || "").trim();
    if (!nro_documento) {
      newErrors.nro_documento = "El DNI es obligatorio";
    } else if (!/^\d{8}$/.test(nro_documento)) {
      newErrors.nro_documento = "El DNI debe tener exactamente 8 dígitos";
    }

    // Validar teléfono personal (opcional)
    const num_personal = String(formData.num_personal || "").trim();
    if (num_personal && !/^\d+$/.test(num_personal)) {
      newErrors.num_personal = "El teléfono debe contener solo números";
    }

    // Validar teléfono de emergencia (opcional)
    const num_emergencia = String(formData.num_emergencia || "").trim();
    if (num_emergencia && !/^\d+$/.test(num_emergencia)) {
      newErrors.num_emergencia = "El teléfono debe contener solo números";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Asegurar que el valor siempre sea string
    const stringValue = String(value || "");

    setFormData((prev) => ({
      ...prev,
      [name]: stringValue,
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave(formData);
    } else {
      toast.error("Por favor corrige los errores en el formulario");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 xs:p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 xs:mb-4 sm:mb-6">
        <h3 className="text-base xs:text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 border-b-2 border-orange-500 pb-1 mb-2 sm:mb-0">
          Editar Información Personal
        </h3>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 xs:space-y-4 sm:space-y-6"
      >
        {/* Nombres - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 lg:gap-6">
          {/* Nombre */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              Nombre *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.nombre ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese su nombre"
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.nombre}
              </p>
            )}
          </div>

          {/* Apellido */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              Apellido *
            </label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.apellido ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Ingrese su apellido"
            />
            {errors.apellido && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.apellido}
              </p>
            )}
          </div>
        </div>

        {/* Email y DNI - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 lg:gap-6">
          {/* Email */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="correo@ejemplo.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* DNI */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              DNI *
            </label>
            <input
              type="text"
              name="nro_documento"
              value={formData.nro_documento}
              onChange={handleInputChange}
              maxLength="8"
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.nro_documento ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="12345678"
            />
            {errors.nro_documento && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.nro_documento}
              </p>
            )}
          </div>
        </div>

        {/* Teléfonos - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 lg:gap-6">
          {/* Teléfono Personal */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              Teléfono Personal
            </label>
            <input
              type="text"
              name="num_personal"
              value={formData.num_personal}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.num_personal ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="2991234567"
            />
            {errors.num_personal && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.num_personal}
              </p>
            )}
          </div>

          {/* Teléfono de Emergencia */}
          <div className="space-y-1 xs:space-y-2">
            <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
              Teléfono de Emergencia
            </label>
            <input
              type="text"
              name="num_emergencia"
              value={formData.num_emergencia}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${
                errors.num_emergencia ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="2981234567"
            />
            {errors.num_emergencia && (
              <p className="text-red-500 text-xs sm:text-sm mt-1">
                {errors.num_emergencia}
              </p>
            )}
          </div>
        </div>

        {/* Fecha de Nacimiento - Full Width */}
        <div className="space-y-1 xs:space-y-2">
          <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            name="fechaNac"
            value={formData.fechaNac}
            onChange={handleInputChange}
            className="w-full sm:max-w-md px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
          />
        </div>

        {/* Patologías - Full Width Textarea */}
        <div className="space-y-1 xs:space-y-2">
          <label className="block text-xs xs:text-sm sm:text-base font-semibold text-gray-700">
            Patologías
          </label>
          <textarea
            name="patologias"
            value={formData.patologias}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 xs:px-3 xs:py-2.5 sm:px-4 sm:py-3 text-xs xs:text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-vertical min-h-[80px] xs:min-h-[100px] transition-colors"
            placeholder="Describa cualquier condición médica relevante..."
          />
        </div>

        {/* Botones Responsivos */}
        <div className="flex flex-col sm:flex-row gap-2 xs:gap-3 sm:gap-4 pt-3 xs:pt-4 sm:pt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 xs:py-3 sm:py-3 px-3 xs:px-4 rounded-lg transition-all duration-200 text-xs xs:text-sm sm:text-base ${
              loading
                ? "opacity-50 cursor-not-allowed"
                : "active:scale-95 hover:shadow-lg"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                <span className="text-xs xs:text-sm sm:text-base">
                  Guardando...
                </span>
              </div>
            ) : (
              "Guardar Cambios"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2.5 xs:py-3 sm:py-3 px-3 xs:px-4 rounded-lg transition-all duration-200 text-xs xs:text-sm sm:text-base active:scale-95 hover:shadow-lg"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
