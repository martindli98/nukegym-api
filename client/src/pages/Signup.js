import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import UserModel from "../model/userModel";

const SignUp = () => {
  const [formValues, setFormValues] = useState(new UserModel({}));
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};

    if (!formValues.email) {
      errors.email = "El email es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      errors.email = "Por favor ingrese una dirección de email válida";
    }
    if (!formValues.nro_documento) {
      errors.nro_documento = "El número de documento es obligatorio";
    } else if (!/^\d{8}$/.test(formValues.nro_documento)) {
      errors.nro_documento = "El número de documento debe tener 8 dígitos";
    }

    if (!formValues.turno) {
      errors.turno = "Debe seleccionar un turno";
    }

    if (!formValues.password) {
      errors.password = "Ingrese una contraseña";
    }
    return errors;
  };

  // Función para iniciar sesión automáticamente después del registro
  const autoLogin = async (email, password) => {
    try {
      console.log("Iniciando sesión automáticamente...");

      const loginResponse = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: email,
          password: password,
        }
      );

      if (loginResponse.data.success) {
        const token = loginResponse.data.token;
        const user = loginResponse.data.user;

        // Guardar token en sessionStorage
        sessionStorage.setItem("authToken", token);

        // Guardar datos del usuario para el Header
        const userData = {
          isLoggedIn: true,
          userData: {
            name: user?.nombre || user?.email || "Usuario",
            email: user?.email,
            id: user?.id,
          },
        };

        sessionStorage.setItem("userData", JSON.stringify(userData));

        console.log(" Login automático exitoso");
        toast.success("¡Registro exitoso! Redirigiendo al perfil...");

        // Redirigir al perfil después de un breve delay
        setTimeout(() => {
          navigate("/profile");
        }, 1500);

        return true;
      } else {
        console.error("Error en login automático:", loginResponse.data.message);
        return false;
      }
    } catch (error) {
      console.error("Error en login automático:", error);
      toast.error(
        "Registro exitoso, pero hubo un problema al iniciar sesión. Por favor, inicia sesión manualmente."
      );

      // Redirigir al login si el auto-login falla
      setTimeout(() => {
        navigate("/login");
      }, 2000);

      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos del formulario:", formValues);

    const errors = validateForm();
    console.log("Errores de validación:", errors);

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Por favor corrige los errores en el formulario");
      return;
    }

    try {
      console.log("Enviando datos de registro...");

      const response = await axios.post(
        "http://localhost:3000/api/auth/register-user",
        formValues
      );

      console.log(" Respuesta del registro:", response.data);

      if (response.data.success) {
        // Limpiar errores
        setFormErrors({});

        console.log(" Iniciando sesión automáticamente...");

        // Realizar login automático
        const loginSuccess = await autoLogin(
          formValues.email,
          formValues.password
        );

        if (loginSuccess) {
          // Limpiar formulario solo si el login automático fue exitoso
          setFormValues({
            email: "",
            nro_documento: "",
            password: "",
          });
        }
      } else {
        toast.error(response.data.message || "Error en el registro");
      }
    } catch (error) {
      console.error(" Error durante el registro:", error);
      toast.error(
        error.response?.data?.message ||
          "Algo salió mal. Por favor intenta de nuevo."
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {/* Título */}
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Registrarse
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-100 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="Ingrese su email"
              value={formValues.email}
              onChange={handleInputChange}
              className="px-4 py-2 text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            {formErrors.email && (
              <span className="text-red-500 text-sm mt-1">
                {formErrors.email}
              </span>
            )}
          </div>

          {/* DNI */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
              D.N.I
            </label>
            <input
              type="text"
              name="nro_documento"
              placeholder="Ingrese su D.N.I"
              value={formValues.nro_documento}
              onChange={handleInputChange}
              className="px-4 py-2 text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            {formErrors.nro_documento && (
              <span className="text-red-500 text-sm mt-1">
                {formErrors.nro_documento}
              </span>
            )}
          </div>

          {/* Turno */}
          <div className="flex flex-col">
            <label className="mb-1 text-gray-700 dark:text-gray-300">
              Turno
            </label>
            <select
              name="turno"
              value={formValues.turno}
              onChange={handleInputChange}
              className="px-4 py-2 text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="">Seleccione un turno</option>
              <option value="mañana">Mañana</option>
              <option value="tarde">Tarde</option>
              <option value="noche">Noche</option>
            </select>
            {formErrors.turno && (
              <span className="text-red-500 text-sm">{formErrors.turno}</span>
            )}
          </div>

          {/* Contraseña */}
          <div className="flex flex-col">
            <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              placeholder="Ingrese su contraseña"
              value={formValues.password}
              onChange={handleInputChange}
              className="px-4 py-2 text-gray-100 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
            />
            {formErrors.password && (
              <span className="text-red-500 text-sm mt-1">
                {formErrors.password}
              </span>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            className="w-full py-2 font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 
                     text-white hover:opacity-90 transition-transform hover:scale-[1.02] shadow-md"
          >
            Registrarse
          </button>
        </form>

        {/* Link a Login */}
        <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
          ¿Ya tienes una cuenta?{" "}
          <Link
            to="/login"
            className="text-orange-500 dark:text-purple-300 font-semibold hover:underline"
          >
            Ingresar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
