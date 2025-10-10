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
        console.log(" Login exitoso:", response.data);

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

        console.log(" Datos guardados:", {
          token: !!token,
          userData: userData,
        });

        toast.success("¡Login exitoso! Redirigiendo...");

        // Redirigir al perfil después de un breve delay
        setTimeout(() => {
          navigate("/profile");
        }, 1000);
      } else {
        toast.error(response.data.message || "Login fallido");
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error(
        error.response.data.message || "Algo salio mal. Intenta de nuevo"
      );
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span className="error-message">{errors.email}</span>
          )}
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Ingrese su contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="error-message">{errors.password}</span>
          )}
        </div>
        <button type="submit" className="login-btn">
          Entrar
        </button>
      </form>

      <p style={{ textAlign: "center" }}>
        ¿No tienes una cuenta?{" "}
        <Link
          to="/signUp"
          className="toggle-link"
          style={{ color: "#007BFF", textDecoration: "underline" }}
        >
          Registrarse
        </Link>
      </p>
    </div>
  );
};

export default Login;
