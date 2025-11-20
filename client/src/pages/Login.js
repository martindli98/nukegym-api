import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Validation function for email and password
  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!password) {
      errors.password = "Password is required";
    }
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    // const validationErrors = validateForm();
    // if (Object.keys(validationErrors).length > 0) {
    //   setErrors(validationErrors);
    //   return;
    // }

    try {
      // Make API request to login
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        /* console.log(" Login exitoso:", response.data); */

        const token = response.data.token;
        const user = response.data.user; // Asumimos que el backend devuelve datos del usuario

        // Guardar token en sessionStorage para consistencia
        sessionStorage.setItem("authToken", token);

        // Guardar datos del usuario para el Header
 const userData = {
  isLoggedIn: true,
  userData: {
    name: user?.nombre || user?.email || "Usuario",
    email: user?.email,
    id: user?.id,
    rol: user?.rol || "cliente", // O "admin" si id_rol = 1
    id_rol: user?.id_rol,         // guardar también el id_rol directamente
    id_trainer: user?.id_trainer, // guardar el id_trainer si está disponible
  },
};
sessionStorage.setItem("userData", JSON.stringify(userData));

       /*  console.log(" Datos guardados:", {
          token: !!token,
          userData: userData,
        }); */

        toast.success("¡Login exitoso! Redirigiendo...");

        // Redirigir al perfil después de un breve delay
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        toast.error(response.data.message || "Login fallido");
      }
    } catch (error) {
      /* console.error("Error during login:", error); */
      toast.error(
        error.response.data.message || "Algo salio mal. Intenta de nuevo"
      );
    }
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300 px-4">
    <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-colors duration-300">

      {/* Título */}
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Iniciar sesión
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
          {errors.email && (
            <span className="text-red-500 text-sm mt-1">{errors.email}</span>
          )}
        </div>

        {/* Contraseña */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none transition"
          />
          {errors.password && (
            <span className="text-red-500 text-sm mt-1">{errors.password}</span>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="w-full py-2 font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-purple-600 text-white hover:opacity-90 transition-transform hover:scale-[1.02] shadow-md"
        >
          Entrar
        </button>
      </form>

      {/* Registro */}
      <p className="text-center mt-6 text-gray-700 dark:text-gray-300">
        ¿No tienes una cuenta?{" "}
        <Link
          to="/signUp"
          className="text-orange-500 dark:text-purple-300 font-semibold hover:underline"
        >
          Registrarse
        </Link>
      </p>
    </div>
  </div>
);

};

export default Login;
