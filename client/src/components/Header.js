import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";

const Header = () => {
  const location = useLocation(); // Get the current location
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      getData();
    }, 200);
  }, [location]);

  const getData = async () => {
    const data = await JSON.parse(sessionStorage.getItem("userData"));
    console.log("useeffct run");

    if (data && data.isLoggedIn) {
      setUserData(data.userData);
    }
  };

  const logout = () => {
    // Limpiar completamente toda la información de sesión
    sessionStorage.clear();
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Resetear estado local
    setUserData(null);

    console.log("Logout completed - All session data cleared");

    // Redirigir al home
    navigate("/");
  };
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src={require("../img/LOGO GYM.png")}
          alt="Profile"
          className="profile-photo-circle"
        />
        <span style={{ color: "#F97709" }}>NUKE</span>
        <span style={{ color: "#691C84" }}>GYM</span>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>
            Inicio
          </Link>
        </li>
        <li>
          <Link
            to="/membership"
            className={location.pathname === "/membership" ? "active" : ""}
          >
            Membresia
          </Link>
        </li>
        <li>
          <Link
            to="/routine"
            className={location.pathname === "/routine" ? "active" : ""}
          >
            Rutina
          </Link>
        </li>

        {/* Conditional Rendering based on user login status */}
        {userData ? (
          <>
            <li>
              <Link to="/trainers" className="">
                Entrenadores
              </Link>
            </li>

            {userData.id_rol === 1 && (
              <li>
                <Link
                  to="/admin/roles"
                  className={`hover:text-orange-500 font-semibold ${
                    location.pathname === "/admin/roles"
                      ? "text-orange-500 underline"
                      : ""
                  }`}
                >
                  Panel de Roles
                </Link>
              </li>
            )}

            <li className="navbar-profile">
              <Link
                to="/profile"
                className={location.pathname === "/profile" ? "active" : ""}
                style={{ display: "flex" }}
              >
                <img
                  src={require("../img1.png")}
                  alt="Profile"
                  className="profile-photo-circle"
                />
                <span className="username">{userData.name}</span>
              </Link>
            </li>
            <li>
              <i
                className="fas fa-sign-out-alt logo-icon"
                style={{ cursor: "pointer" }}
                onClick={logout}
              ></i>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link
                to="/login"
                className={location.pathname === "/login" ? "active" : ""}
              >
                Ingresar
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className={location.pathname === "/signup" ? "active" : ""}
              >
                Registrarse
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
