import React, { useEffect, useState } from "react";
import axios from "axios";
import RenderCard from "../components/Membership/renderCard";

import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
// Inicializa Mercado Pago con tu Public Key
initMercadoPago("APP_USR-11d59ac8-e81f-4d7b-8407-6fb56c8550fa", {
  locale: "es-AR",
});

function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [error, setError] = useState("");

  const [preferenceId, setPreferenceId] = useState(null);
  //--------------------------------
  const createPreference = async () => {
    // Obtener datos del usuario y token desde sessionStorage
    const session = JSON.parse(sessionStorage.getItem("userData"));
    const user = session?.userData;
    const token = sessionStorage.getItem("authToken");

    if (!user || !user.id) {
      alert("ERROR: Usuario no encontrado. Por favor, inicia sesión.");
      return null;
    }

    if (!token) {
      alert("ERROR: Debes iniciar sesión para realizar pagos.");
      return null;
    }

    console.log("Usuario almacenado:", user);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/payments/create_preference",
        {
          title: "Renovación de Membresía",
          quantity: 1,
          price: 1000, // Precio en moneda local
          userId: user.id,
          tipo_plan: "1m", // Tipo de plan de ejemplo
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { preferenceId } = response.data;

      if (!preferenceId) {
        throw new Error("No se pudo crear la preferencia de pago.");
      }

      return preferenceId;
    } catch (error) {
      console.error(
        "Error creando la preferencia:",
        error.response?.data || error
      );
      alert(
        error.response?.data?.message ||
          "Ocurrió un error al crear la preferencia de pago."
      );
      return null;
    }
  };

  const handleBuy = async () => {
    const id = await createPreference();
    setPreferenceId(id);
  };
  //--------------------------------

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
    cardToRender = (
      <RenderCard title="✅ Tu membresía está activa" color="green" />
    );
  } else if (membership?.data?.estado === "baja") {
    cardToRender = (
      <RenderCard title="⚠️ Tu membresía está dada de baja" color="yellow" />
    );
  } else {
    cardToRender = (
      <>
        <div className="flex flex-col items-center">
          <RenderCard
            title="❌ Tu membresía expiró"
            subtitle="Adquirí un plan para acceder al gimnasio 🏋️‍♂️"
            color="red"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-5"
            onClick={handleBuy}
          >
            ¿Desea renovar?
          </button>
          <div className="mt-3">
            {preferenceId && (
              <Wallet initialization={{ preferenceId: preferenceId }} />
            )}
          </div>
        </div>
      </>
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
