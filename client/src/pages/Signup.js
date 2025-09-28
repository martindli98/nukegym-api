import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import UserModel from "../model/userModel";

const SignUp = () => {
  const [formValues, setFormValues] = useState(new UserModel({}));

  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};

    /*   if (!formValues.nombre) {
      errors.nombre = "nombre is required";
    } else if (!/^[A-Za-z0-9_]{3,15}$/.test(formValues.nombre)) {
      errors.nombre =
        "El nombre de usuario debe tener entre 3 y 15 caracteres y solo puede contener letras, números y guiones bajos";
    } */

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formValues);

    const errors = validateForm();
    console.log(errors);
    if (Object.keys(errors).length === 0) {
      // alert("Form submitted")
    } else {
      // alert("Form Submission Failed");
      setFormErrors(errors);
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register-user",
        formValues
      );
      console.log(response, "res");

      if (response.data.success) {
        toast.success(response.data.message || "Registration successful!");
        setFormValues({
          /* nombre: "", */
          email: "",
          nro_documento: "",
          password: "",
        });
        setFormErrors("");
      } else {
        toast.error(response.data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error(
        error.response.data.message ||
          "Something went wrong. Please try again later."
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
