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

    if (!formValues.password) {
      errors.password = "Password is required";
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
    <div className="login-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {/*  <label>Nombre de usuario</label>
          <input
            type="text"
            placeholder="Ingrese su nombre de usuario"
            name="nombre"
            value={formValues.nombre}
            onChange={handleInputChange}
          />
          {formErrors.nombre ? (
            <span className="error-message">{formErrors.nombre}</span>
          ) : (
            ""
          )} */}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="Ingrese su email"
            value={formValues.email}
            onChange={handleInputChange}
          />
          {formErrors.email ? (
            <span className="error-message">{formErrors.email}</span>
          ) : (
            ""
          )}
        </div>
        <div className="form-group">
          <label>D.N.I</label>
          <input
            type="text"
            name="nro_documento"
            placeholder="Ingrese su D.N.I"
            value={formValues.nro_documento}
            onChange={handleInputChange}
          />
          {formErrors.nro_documento ? (
            <span className="error-message">{formErrors.nro_documento}</span>
          ) : (
            ""
          )}
        </div>
        <div className="form-group">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            placeholder="Ingrese su contraseña"
            value={formValues.password}
            onChange={handleInputChange}
          />
          {formErrors.password ? (
            <span className="error-message">{formErrors.password}</span>
          ) : (
            ""
          )}
        </div>
        <button type="submit" className="login-btn">
          Registrarse
        </button>
      </form>
      <p style={{ textAlign: "center" }}>
        ¿Ya tienes una cuenta?{" "}
        <Link
          to="/login"
          className="toggle-link"
          style={{ color: "#007BFF", textDecoration: "underline" }}
        >
          Ingresar
        </Link>
      </p>
    </div>
  );
};

export default SignUp;
