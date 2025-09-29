import React, { useEffect, useState } from "react";
import axios from "axios";
import RenderCard from "../components/Membership/renderCard";

function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMembershipStatus = async () => {
      try {
        const token = sessionStorage.getItem("authToken");

        if (!token) {
          setError("Debes iniciar sesión para ver tu membresía.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/membership/status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        /* console.log("Respuesta de membresía:", response.data); */

        if (response.data.success) {
          setMembershipStatus(response.data.membershipActive);
          setMembership(response.data);
        } else {
          setError(response.data.message || "No se pudo obtener la membresía.");
        }
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message || "Error al consultar la membresía."
        );
      }
    };

    fetchMembershipStatus();
  }, []);

      let cardToRender;

        if (error) {
          cardToRender = <RenderCard title={error} color="red" />;
        } else if (membershipStatus === null) {
          cardToRender = <RenderCard title="Cargando estado de la membresía..." />;
        } else if (membershipStatus === true) {
          cardToRender = <RenderCard title="✅ Tu membresía está activa" color="green" />;
        } else if (membership?.data?.estado === "baja") {
          cardToRender = <RenderCard title="⚠️ Tu membresía está dada de baja" color="yellow" />;
        } else {
          cardToRender = (
            <RenderCard
              title="❌ Tu membresía expiró"
              subtitle="Adquirí un plan para acceder al gimnasio 🏋️‍♂️"
              color="red"
            />
          );
        }

        return (
          <div
          style={{
            backgroundImage: `url(${require("../img/fondo2.jpg")})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
            {cardToRender}
          </div>
        );
      }

export default Membership;
