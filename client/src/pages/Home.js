import React from "react";
import fondoGym from "../img/fondo.jpg"; // ajustá la ruta a tu imagen

function Home() {
  return (
    <div
      style={{
        backgroundImage: `url(${fondoGym})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.6)", // negro con opacidad
          padding: "30px 50px",
          borderRadius: "12px",
          textAlign: "center",
          color: "white",
          boxShadow: "0px 4px 10px rgba(0,0,0,0.7)",
        }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "bold" }}>
          Bienvenidos a <span style={{ color: "#ffcc00" }}>NukeGym</span>
        </h2>
        <p style={{ marginTop: "10px", fontSize: "18px", opacity: 0.9 }}>
          Tu lugar para entrenar
        </p>
      </div>
    </div>
  );
}

export default Home;


