import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import "../App.css";

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  // Hook para verificar notificaciones (solo para clientes)
  useNotifications(userData);

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);

    // Leer modo oscuro desde localStorage o sistema
    const savedTheme = localStorage.getItem("theme");
    if (
      savedTheme === "dark" ||
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
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
      <div className="flex items-center space-x-2 animate-fadeInLeft">
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
          <button
            onClick={() => {
              if (!userData) {
                // 🔸 SCROLL A SECCIÓN DEL HOME
                window.location.href = "/#membership-info";
              } else {
                navigate("/membership");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors`}
          >
            Planes
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              if (!userData) {
                window.location.href = "/#routine-info";
              } else {
                navigate("/routine");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors`}
          >
            Rutina
          </button>
        </li>

        <li>
          <button
            onClick={() => {
              if (!userData) {
                window.location.href = "/#classes-info";
              } else {
                navigate("/classes");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors`}
          >
            Clases
          </button>
        </li>

        {/* Conditional Rendering */}
        {userData ? (
          <>
            {/* {userData.id_rol === 2 && (
              <li>
                <Link
                  to="/trainers"
                  className="font-medium hover:text-orange-500 transition-colors"
                >
                  Entrenadores
                </Link>
              </li>
            )} */}

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
              <>
                <li>
                  <Link
                    to="/admin/roles"
                    className={`font-semibold hover:text-orange-500 transition-colors ${
                      location.pathname === "/admin/roles"
                        ? "text-orange-500 underline"
                        : ""
                    }`}
                  >
                    Panel de Roles
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/notifications"
                    className={`font-semibold hover:text-orange-500 transition-colors ${
                      location.pathname === "/admin/notifications"
                        ? "text-orange-500 underline"
                        : ""
                    }`}
                  >
                    Panel de Notificaciones
                  </Link>
                </li>
              </>
            )}

            {/* Notificaciones para clientes y entrenadores */}
            {userData && (userData.id_rol === 2 || userData.id_rol === 3) && (
              <li>
                <Link
                  to="/notifications"
                  className={`font-semibold hover:text-orange-500 transition-colors ${
                    location.pathname === "/notifications"
                      ? "text-orange-500 underline"
                      : ""
                  }`}
                >
                  Notificaciones
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
                className={`font-medium transition-colors bg-gradient-to-r from-orange-500 to-purple-600 hover:bg-orange-600 px-4 py-2 rounded-lg inline-block text-white hover:opacity-90 hover:scale-[1.02] shadow-md ${
                  location.pathname === "/login"
                    ? "text-orange-500 "
                    : ""
                }`}
              >
                Ingresar
              </Link>
            </li>
            {/* <li>
              <Link
                to="/signup"
                className={`font-medium hover:text-orange-500 transition-colors ${
                  location.pathname === "/signup"
                    ? "text-orange-500 underline"
                    : ""
                }`}
              >
                Registrarse
              </Link>
            </li> */}
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
