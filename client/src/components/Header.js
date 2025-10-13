import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);

    // Leer modo oscuro desde localStorage o sistema
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, [location]);

  const getData = async () => {
    const data = await JSON.parse(sessionStorage.getItem("userData"));
    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    }
  };

  const logout = () => {
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setUserData(null);
    navigate("/");
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 shadow-md fixed top-0 w-full z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <img
          src={require("../img/LOGO GYM.png")}
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="text-2xl font-bold">
          <span className="text-orange-500">NUKE</span>
          <span className="text-purple-700 dark:text-purple-400">GYM</span>
        </div>
      </div>

      {/* Links */}
      <ul className="flex items-center space-x-6 text-gray-700 dark:text-gray-200">
        <li>
          <Link
            to="/"
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/" ? "text-orange-500 underline" : ""
            }`}
          >
            Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/membership"
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/membership" ? "text-orange-500 underline" : ""
            }`}
          >
            Membresía
          </Link>
        </li>
        <li>
          <Link
            to="/routine"
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/routine" ? "text-orange-500 underline" : ""
            }`}
          >
            Rutina
          </Link>
        </li>
        <li>
          <Link
            to="/classes"
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/classes" ? "text-orange-500 underline" : ""
            }`}
          >
            Clases
          </Link>
        </li>

        {/* Conditional Rendering */}
        {userData ? (
          <>
            {userData.id_rol === 2 && (
              <li>
                <Link
                  to="/trainers"
                  className="font-medium hover:text-orange-500 transition-colors"
                >
                  Entrenadores
                </Link>
              </li>
            )}

            {userData.id_rol === 3 && (
              <li>
                <Link
                  to="/trainers"
                  className="font-medium hover:text-orange-500 transition-colors"
                >
                  Alumnos
                </Link>
              </li>
            )}

            {userData.id_rol === 1 && (
              <li>
                <Link
                  to="/admin/roles"
                  className={`font-semibold hover:text-orange-500 transition-colors ${
                    location.pathname === "/admin/roles" ? "text-orange-500 underline" : ""
                  }`}
                >
                  Panel de Roles
                </Link>
              </li>
            )}

            {/* Profile */}
            <li className="flex items-center space-x-2">
              <Link
                to="/profile"
                className={`flex items-center space-x-2 font-medium hover:text-orange-500 transition-colors ${
                  location.pathname === "/profile" ? "text-orange-500" : ""
                }`}
              >
                <img
                  src={require("../img1.png")}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-orange-500"
                />
                <span>{userData.name}</span>
              </Link>
            </li>

            <li>
              <i
                className="fas fa-sign-out-alt text-xl cursor-pointer hover:text-orange-500 transition-colors"
                onClick={logout}
              ></i>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className={`font-medium hover:text-orange-500 transition-colors ${
                  location.pathname === "/login" ? "text-orange-500 underline" : ""
                }`}
              >
                Ingresar
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={`font-medium hover:text-orange-500 transition-colors ${
                  location.pathname === "/signup" ? "text-orange-500 underline" : ""
                }`}
              >
                Registrarse
              </Link>
            </li>
          </>
        )}

        {/* Botón modo oscuro */}
        <li>
          <button
            onClick={toggleDarkMode}
            className="text-xl text-gray-700 dark:text-gray-200 hover:text-orange-500 transition-colors"
          >
            {darkMode ? (
              <i className="fas fa-sun"></i> // ☀️ Modo claro
            ) : (
              <i className="fas fa-moon"></i> // 🌙 Modo oscuro
            )}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Header;
