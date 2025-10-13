import React, { useEffect, useState } from "react";
import axios from "axios";
import RenderCard from "../components/Membership/renderCard";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";

initMercadoPago("APP_USR-8bacf5ea-5022-42bb-91dd-4b92f2b04d7b", {
  locale: "es-AR",
});

function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [error, setError] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);

  const createPreference = async () => {
    const session = JSON.parse(sessionStorage.getItem("userData"));
    const user = session?.userData;
    const token = sessionStorage.getItem("authToken");

    if (!user?.id || !token) {
      alert("ERROR: Debes iniciar sesión para continuar.");
      return null;
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/api/payments/create_preference",
        {
          title: "Renovación de Membresía",
          quantity: 1,
          price: 1000,
          userId: user.id,
          tipo_plan: "1m",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { preferenceId } = response.data;
      return preferenceId || null;
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Error al crear la preferencia de pago.");
      return null;
    }
  };

  const handleBuy = async () => {
    const id = await createPreference();
    setPreferenceId(id);
  };

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
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setMembershipStatus(response.data.membershipActive);
          setMembership(response.data);
        } else {
          setError(response.data.message || "No se pudo obtener la membresía.");
        }
      } catch (err) {
        console.error(err);
        setError("Error al consultar la membresía.");
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
      <div className="flex flex-col items-center bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-fadeIn">
        <RenderCard
          title="❌ Tu membresía expiró"
          subtitle="Adquirí un plan para acceder al gimnasio 🏋️‍♂️"
          color="white"
        />
        <button
          onClick={handleBuy}
          className="mt-6 w-full bg-gradient-to-r from-[#fa7808] to-[#ff9f1a] hover:from-[#ff9f1a] hover:to-[#fa7808] text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform hover:scale-105 duration-300"

        >
          Renovar Membresía
        </button>
        {preferenceId && <div className="mt-4 w-full"><Wallet initialization={{ preferenceId }} /></div>}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${require("../img/fondo2.jpg")})` }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex flex-col items-center justify-center px-4">
        {cardToRender}
      </div>
    </div>
  );
}

export default Membership;
