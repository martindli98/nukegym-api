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


  if (error) {
    return <RenderCard title={error} color="red" />;
  }

  if (membershipStatus === null) {
    return <RenderCard title="Cargando estado de la membresía..." />;
  }

  if (membershipStatus === true) {
  return <RenderCard title="✅ Tu membresía está activa" />;
} else {
  
  if (membership?.data?.estado === "baja") {
    console.log('entra a baja')
    return <RenderCard title="⚠️ Tu membresía está dada de baja" />;
  } else {
    return (
      <RenderCard
        title="❌ Tu membresía expiró"
        subtitle="Adquirí un plan para acceder al gimnasio 🏋️‍♂️"
      />
    );
  }
}

}

export default Membership;
