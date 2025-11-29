import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useNotifications from "../hooks/useNotifications";
import "../App.css";
import ConfirmModal from "./confirmModal/confirmModal";

const Header = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showRoutineMenu, setShowRoutineMenu] = useState(false);
  const navigate = useNavigate();

  const [confirmConfig, setConfirmConfig] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const openConfirm = (title, message, onConfirm) => {
    setConfirmConfig({
      show: true,
      title,
      message,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmConfig({ show: false, title: "", message: "", onConfirm: null });
  };

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
      <Link to="/" className="flex items-center space-x-2 animate-fadeInLeft">
        <img
          src={require("../img/LOGO GYM.png")}
          alt="Logo"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="text-2xl font-bold">
          <span className="text-orange-500">NUKE</span>
          <span className="text-purple-700 dark:text-purple-400">GYM</span>
        </div>
      </Link>

      {/* Links */}
      <ul className="flex items-center space-x-6 text-gray-700 dark:text-gray-200">
        <li>
          <button
            onClick={() => {
              navigate("/");
              if (!userData) {
                setTimeout(() => {
                  document
                    .getElementById("inicio-info")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/" ? "border-b-2 border-orange-500" : ""
            }`}
          >
            Inicio
          </button>
        </li>

        <li
          className="relative"
          onMouseEnter={() => setShowRoutineMenu(true)}
          onMouseLeave={() => setShowRoutineMenu(false)}
        >
          <button
            onClick={() => {
              if (!userData) {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("routine-info")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } else {
                navigate("/routine");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/routine"
                ? "border-b-2 border-orange-500"
                : ""
            }`}
          >
            Rutinas
          </button>
          {showRoutineMenu && userData && (
            <div className="absolute top-full left-0  bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 min-w-[160px] z-50">
              <button
                onClick={() => navigate("/progress")}
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Ver progreso
              </button>
            </div>
          )}
        </li>

        <li>
          <button
            onClick={() => {
              if (!userData) {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("classes-info")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } else {
                navigate("/classes");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/classes"
                ? "border-b-2 border-orange-500"
                : ""
            }`}
          >
            Clases
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              if (!userData) {
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("membership-info")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } else {
                navigate("/membership");
              }
            }}
            className={`font-medium hover:text-orange-500 transition-colors ${
              location.pathname === "/membership"
                ? "border-b-2 border-orange-500"
                : ""
            }`}
          >
            Planes
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
                  className={`font-semibold hover:text-orange-500 transition-colors ${
                    location.pathname === "/trainers"
                      ? "border-b-2 border-orange-500"
                      : ""
                  }`}
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
                        ? "border-b-2 border-orange-500"
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
                        ? "border-b-2 border-orange-500"
                        : ""
                    }`}
                  >
                    Panel de Notificaciones
                  </Link>
                </li>
              </>
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

            {/* Notificaciones para clientes y entrenadores */}
            {userData && (userData.id_rol === 2 || userData.id_rol === 3) && (
              <li>
                <Link
                  to="/notifications"
                  className={`font-semibold hover:text-orange-500 transition-colors ${
                    location.pathname === "/notifications"
                      ? "border-b-2 border-orange-500"
                      : ""
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                    />
                  </svg>
                </Link>
              </li>
            )}

            <li>
              <i
                className="fas fa-sign-out-alt text-xl cursor-pointer hover:text-orange-500 transition-colors"
                onClick={() =>
                  openConfirm(
                    "Cerrar sesión",
                    "¿Estás seguro de que deseas cerrar sesión?",
                    logout
                  )
                }
              ></i>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className={`font-medium transition-colors bg-gradient-to-r from-orange-500 to-purple-600 hover:bg-orange-600 px-4 py-2 rounded-lg inline-block text-white hover:opacity-90 hover:scale-[1.02] shadow-md ${
                  location.pathname === "/login" ? "text-orange-500 " : ""
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
      <ConfirmModal
        isOpen={confirmConfig.show}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={() => {
          confirmConfig.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
    </nav>
  );
};

export default Header;
