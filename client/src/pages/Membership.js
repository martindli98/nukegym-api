import React, { useEffect, useState } from "react";
import axios from "axios";
import RenderCard from "../components/Membership/renderCard";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import PDF from "../components/Membership/PDF/PDF";
import { PDFDownloadLink } from "@react-pdf/renderer";


initMercadoPago("APP_USR-8bacf5ea-5022-42bb-91dd-4b92f2b04d7b", {
  locale: "es-AR",
});

function Membership() {
  const [membership, setMembership] = useState(null);
  const [membershipStatus, setMembershipStatus] = useState(null);
  const [error, setError] = useState("");
  const [preferenceId, setPreferenceId] = useState(null);
  const session = JSON.parse(sessionStorage.getItem("userData"));
  const user = session?.userData;
  const token = sessionStorage.getItem("authToken");
 
  const [membershipList,setMembershipList] = useState("");
   
  const [selectedPlan, setSelectedPlan] = useState(); 

  const [plansList,setPlansList]= useState([]);

  const createPreference = async () => {
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
          price: selectedPlan.precio,
          userId: user.id,
          tipo_plan: selectedPlan.id,
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

  const getMembershipList = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
          setError("Debes iniciar sesión.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/membership/list",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setMembershipList(response.data.membershipList);

        } else {
          setError(response.data.message || "No se pudo obtener el listado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al consultar la membresía.");
      }
    };

    const getPlans = async () => {
       try {
        const token = sessionStorage.getItem("authToken");
        if (!token) {
          setError("Debes iniciar sesión.");
          return;
        }

        const response = await axios.get(
          "http://localhost:3000/api/membership/plans",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          setPlansList(response.data.plansList);
     
        } else {
          setError(response.data.message || "No se pudo obtener el listado");
        }
      } catch (err) {
        console.error(err);
        setError("Error al consultar la membresía.");
      }
    }

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
    getMembershipList();
    getPlans();
  }, []);

  useEffect(()=>{
    console.log('------------------------')
    console.log(selectedPlan)
  }, [])
  

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
        <div className="mt-4 w-full">
          <label className="block mb-2 font-medium text-gray-700">Seleccioná un plan:</label>
          <select
              value={selectedPlan?.id || ""}
              onChange={(e) => {
                const plan = plansList.find(p => p.id === Number(e.target.value));
                setSelectedPlan(plan);
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Seleccioná un plan</option>
              {plansList.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.nombre} - ${plan.precio}
                </option>
              ))}
            </select>


        </div>

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
        
        {user?.rol === "admin" ? (
          
          <PDFDownloadLink
            document={<PDF memberships={membershipList} />} // ← pasás el array como prop
            fileName="Membresias.pdf"
          >
                <button class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                    <svg class="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
                    <span>Download</span>
                    </button>
          </PDFDownloadLink>
        ) : (
          cardToRender
        )}
       
      </div>
    </div>
  );
}

export default Membership;
