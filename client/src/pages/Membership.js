import React, { useEffect, useState } from "react";
import axios from "axios";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import PDF from "../components/Membership/PDF/PDF";
import { PDFDownloadLink } from "@react-pdf/renderer";
import fotoActiva from "../img/membership/activa.png"
import fotoBaja from "../img/membership/baja.png"
import fotoExpirada from "../img/membership/expiro.png"
import MembershipCard from "../components/Membership/membershipCard";
import InfoCard from "../components/Membership/infoCard";
import MembershipType from "../components/Membership/membershipType";


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
          console.log(response.data)
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




  let membershipCardRender;
  if (error) {
    membershipCardRender = <MembershipCard title={error} img={fotoBaja} descripcion='Error pa'/>;
  } else if (membershipStatus === null) {
    membershipCardRender = <MembershipCard title="Cargando estado de la membresía..." />;
  } else if (membershipStatus === true) {
    membershipCardRender = <MembershipCard title="Tu membresía está activa" img={fotoActiva} descripcion="Disfruta antes q se termine"/>;
  } else if (membership?.data?.estado === "baja") {
    membershipCardRender = <MembershipCard title="Tu membresía está dada de baja" img={fotoBaja} />;
  } else {
  membershipCardRender = (
    <div
      className="bg-white dark:bg-gray-800
                 text-gray-800 dark:text-white
                 flex flex-col items-center
                 rounded-2xl shadow-2xl max-w-md w-full text-center p-6
                 animate-fadeIn transition-all duration-300
                 hover:-translate-y-1 transition-all duration-300"
    >
      <MembershipCard
        title="Tu membresía expiró"
        descripcion="Adquirí un nuevo plan para seguir entrenando 🏋️‍♂️"
        img={fotoExpirada}
        estado={membership?.data?.estado}
      />

      {/* Selector de plan */}
      <div className="mt-6 w-full text-left">
        <label
          htmlFor="plan-select"
          className="block mb-2 text-sm font-medium text-gray-700 dark:text-purple-200"
        >
          Seleccioná un plan:
        </label>

        <select
          id="plan-select"
          value={selectedPlan?.id || ""}
          onChange={(e) => {
            const plan = plansList.find(
              (p) => p.id === Number(e.target.value)
            );
            setSelectedPlan(plan);
          }}
          className="w-full p-3 rounded-xl border border-gray-300 dark:border-purple-800
                     bg-gray-50 dark:bg-[oklch(15%_0.04_270)] text-gray-900 dark:text-purple-100
                     focus:outline-none focus:ring-2 focus:ring-green-500/70 focus:border-green-500/50
                     transition-all duration-200"
        >
          <option value="">Seleccioná un plan</option>
          {plansList.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.nombre} — ${plan.precio}
            </option>
          ))}
        </select>
      </div>

      {/* Botón de acción */}
      <button
        onClick={handleBuy}
        disabled={!selectedPlan}
        className={`mt-6 w-full py-3 rounded-xl font-semibold text-white shadow-lg transition-transform duration-300 ${
          selectedPlan
            ? "bg-gradient-to-r from-[#fa7808] to-[#ff9f1a] hover:scale-105 hover:shadow-xl"
            : "bg-gray-500 cursor-not-allowed opacity-70"
        }`}
      >
        {selectedPlan ? "Renovar Membresía" : "Seleccioná un plan"}
      </button>

      {/* Mercado Pago Wallet */}
      {preferenceId && (
        <div className="mt-4 w-full">
          <Wallet initialization={{ preferenceId }} />
        </div>
      )}
    </div>
  );
}


let infoCardRender;

if (error) {
  infoCardRender = (
    <InfoCard estado={error} inicio="--" fin="--" tipo="--" />
  );
} else if (!membership?.data) {
  infoCardRender = (
    <InfoCard estado="Cargando..." inicio="--" fin="--" tipo="--" />
  );
} else {
  infoCardRender = (
    <InfoCard
      estado={membership.data.estado}
      inicio={membership.data.fechaInicio}
      fin={membership.data.fechaFin}
      tipo={membership.data.tipo}
    />
  );
}
return (
  <div className="min-h-screen w-full bg-gray-100 dark:bg-gray-900 py-10 px-6 flex justify-center transition-colors duration-300">
    <div className="w-full max-w-6xl flex flex-col gap-10 animate-fadeInUp">

      {/* SI ES ADMIN */}
      {user?.rol === "admin" ? (
        <>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">

            Listado de Membresías
          </h1>

          <p className="text-gray-600 dark:text-gray-400 text-sm tracking-wide mb-6">
            Administración completa de membresías en NUKEGYM
          </p>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-orange-500 dark:text-orange-400">📋 Membresías registradas</h2>

            {Array.isArray(membershipList) && membershipList.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300">Cargando listado...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200 dark:bg-gray-700">
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Usuario</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Tipo</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Estado</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Inicio</th>
                      <th className="p-3 text-left text-gray-700 dark:text-gray-300">Fin</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.isArray(membershipList) && membershipList.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[oklch(17%_0.04_270)] transition-colors"
                      >
                        <td className="p-3 text-gray-800 dark:text-gray-100">{m.nombre} {m.apellido}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-100">{m.tipo}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-100">{m.estado}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-100">{m.fechaInicio}</td>
                        <td className="p-3 text-gray-800 dark:text-gray-100">{m.fechaFin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Botón PDF */}
            <div className="mt-6">
              <PDFDownloadLink
                document={<PDF memberships={membershipList} />}
                fileName="Membresias.pdf"
              >
                <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-xl transition">
                  Descargar PDF
                </button>
              </PDFDownloadLink>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              Tu membresía
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm tracking-wide">
              Gestión y estado actual de tu plan en NUKEGYM
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {membershipCardRender}
            {infoCardRender}
          </div>

        </>
      )}

      <div className="w-full h-px bg-gray-300 dark:bg-gray-700 my-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <MembershipType
          title="Plan Básico"
          img="/img/basic.png"
          descripcion="Acceso al gimnasio en horario estándar. Ideal para quienes comienzan."
          color="purple"
        />

        <MembershipType
          title="Plan Intermedio"
          img="/img/intermedio.png"
          descripcion="Incluye rutinas personalizadas y asesoramiento mensual."
          color="blue"
        />

        <MembershipType
          title="Plan Premium"
          img="/img/premium.png"
          descripcion="Acceso completo, entrenador personal y seguimiento avanzado."
          color="yellow"
        />
      </div>

    </div>
  </div>
);





;
}

export default Membership;
