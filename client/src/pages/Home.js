// Home.js actualizado con animaciones variadas y soporte de dark mode
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import fondoGym from "../img/fondo.jpg";
import MembershipType from "../components/Membership/membershipType";
import Rutina from "../img/home/Rutina.png";
import Progreso from "../img/home/Progreso.png";
import ArmarRutina from "../img/home/ArmarRutina.png";
import Celu1 from "../img/home/celu1.png";
import Celu2 from "../img/home/celu2.png";
import Clases from "../img/home/Clases.png";
import PlanBasico from "../img/membershipType/PlanBasico2.png";
import PlanPremium from "../img/membershipType/PlanPremium1.png";
import PlanIntermedio from "../img/membershipType/PlanIntermedio1.png";
import { Dumbbell, UserCheck, Target, Flower, Flame, Ellipsis } from "lucide-react";
function Home() {
  const infoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [plansList, setPlansList] = useState([]);

  // --------------------------------------
  // GET MEMBERSHIP PLANS
  // --------------------------------------
  useEffect(() => {
    const getPlans = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/membership/plans");
        if (response.data.success) setPlansList(response.data.plansList);
      } catch (error) {
        console.error("Error al obtener planes:", error);
      }
    };
    getPlans();
  }, []);

  // --------------------------------------
  // OBSERVER PARA MAPA
  // --------------------------------------
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    if (infoRef.current) observer.observe(infoRef.current);

    return () => {
      if (infoRef.current) observer.unobserve(infoRef.current);
    };
  }, []);

  // --------------------------------------
  // OBSERVER PARA ANIMACIONES ON-SCROLL
  // --------------------------------------
  useEffect(() => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const anim = entry.target.dataset.anim;
            entry.target.classList.add(anim, "opacity-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // ==========================
  //    RENDER
  // ==========================
  return (
    <div className="flex flex-col dark:bg-gray-900 bg-gray-100 transition-colors duration-300">

      {/* ===================================== */}
      {/* HERO */}
      {/* ===================================== */}
      <div
        id="inicio-info"
        className="h-screen bg-cover bg-center pb-20 flex items-center justify-center"
        style={{ backgroundImage: `url(${fondoGym})` }}
      >
        <div
          className="bg-black/60 dark:bg-black/70 backdrop-blur-sm px-8 py-10 rounded-xl text-center shadow-2xl max-w-lg border border-white/10 animate-on-scroll opacity-0"
          data-anim="animate-fadeInUp"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenidos a <span className="text-orange-500">NukeGym</span>
          </h2>
          <p className="mt-3 text-lg text-gray-200 dark:text-gray-300 animate-on-scroll opacity-0" data-anim="animate-zoomIn">
            Tu lugar para entrenar
          </p>
        </div>
      </div>

      {/* ===================================== */}
      {/* ¿POR QUÉ ELEGIRNOS? */}
      {/* ===================================== */}
      <div className="bg-gray-800 dark:bg-gray-950 text-white py-14 px-6">
        <p className="text-center text-orange-500 font-medium tracking-widest text-sm animate-on-scroll opacity-0" data-anim="animate-slideUp">
          ¿POR QUÉ ELEGIRNOS?
        </p>

        <h2 className="text-center text-3xl md:text-4xl font-extrabold mt-2 mb-10 animate-on-scroll opacity-0" data-anim="animate-fadeInUp">
          LLEVÁ TUS LÍMITES AL SIGUIENTE NIVEL
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <Dumbbell className="w-10 h-10 text-orange-500" />,
              title: "Equipamiento moderno",
              desc: "Máquinas y tecnología de última generación.",
              anim: "animate-fadeInLeft",
            },
            {
              icon: <UserCheck className="w-10 h-10 text-orange-500" />,
              title: "Entrenamiento profesional",
              desc: "Rutinas personalizadas con seguimiento.",
              anim: "animate-fadeInUp",
            },
            {
              icon: <Target className="w-10 h-10 text-orange-500" />,
              title: "Adaptado a tus necesidades",
              desc: "Un enfoque pensado para vos.",
              anim: "animate-fadeInRight",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="text-center flex flex-col items-center animate-on-scroll opacity-0"
              data-anim={item.anim}
            >
              <div className="w-20 h-20 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================== */}
      {/* SECCIONES CATALOGO */}
      {/* ===================================== */}

      {/* --- 1: Rutinas --- */}
      <div
        className="relative w-full min-h-[380px] flex items-center justify-between px-10 overflow-hidden bg-gradient-to-r from-gray-800 to-black animate-on-scroll opacity-0"
        data-anim="animate-slideLeft"
      >
        <img src={Rutina} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative flex items-center w-full">
          <div className="w-1/2 flex items-center justify-center animate-on-scroll opacity-0" data-anim="animate-fadeInLeft">
            <img src={Rutina} className="w-full max-w-[550px] rounded-xl object-contain" />
          </div>

          <div
            className="w-1/2 text-white animate-on-scroll opacity-0"
            data-anim="animate-fadeInRight"
          >
            <p className="text-4xl font-bold leading-tight text-right">
              Amplio catálogo de ejercicios <br /> con filtros personalizados.
            </p>
          </div>
        </div>
      </div>

      {/* --- 2: Progreso --- */}
      <div
        className="relative w-full min-h-[380px] flex items-center justify-between px-10 py-3 overflow-hidden bg-gradient-to-r from-black to-gray-500 animate-on-scroll opacity-0"
        data-anim="animate-fadeInUp"
      >
        <img src={Progreso} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative flex items-center w-full">
          <div className="w-1/2 text-white animate-on-scroll opacity-0" data-anim="animate-slideLeft">
            <p className="text-3xl font-bold leading-tight text-left">
              Registro real de peso, repeticiones y evolución.
            </p>
          </div>

          <div className="w-1/2 flex items-center justify-center animate-on-scroll opacity-0" data-anim="animate-slideUp">
            <img src={Progreso} className="w-full max-w-[550px] rounded-xl object-contain" />
          </div>
        </div>
      </div>

      {/* --- 3: Armar Rutina --- */}
      <div
        className="relative w-full min-h-[380px] flex items-center justify-between px-10 py-3 overflow-hidden bg-gradient-to-r from-gray-800 to-black animate-on-scroll opacity-0"
        data-anim="animate-zoomIn"
      >
        <img src={ArmarRutina} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative flex items-center w-full">
          <div className="w-1/2 flex items-center justify-center animate-on-scroll opacity-0" data-anim="animate-fadeInLeft">
            <img src={ArmarRutina} className="w-full max-w-[550px] rounded-xl object-contain" />
          </div>

          <div className="w-1/2 text-white animate-on-scroll opacity-0" data-anim="animate-fadeInRight">
            <p className="text-4xl font-bold leading-tight text-right">
              Diseñá tu rutina ideal <br /> combinando filtros avanzados.
            </p>
          </div>
        </div>
      </div>

      {/* --- 4: App Móvil --- */}
      <div
        className="relative w-full min-h-[380px] flex items-center justify-between px-10 py-3 overflow-hidden bg-gradient-to-r from-black to-gray-500 animate-on-scroll opacity-0"
        data-anim="animate-fadeInRight"
      >
        <img src={Progreso} className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm" />
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative flex items-center w-full">
          <div className="w-1/2 text-white animate-on-scroll opacity-0" data-anim="animate-slideUp">
            <p className="text-3xl font-bold leading-tight text-left">
              Seguimiento rápido y fácil desde tu celular.
            </p>
          </div>

          <div className="w-1/2 flex gap-4 items-center justify-center animate-on-scroll opacity-0" data-anim="animate-zoomIn">
            <img src={Celu1} className="w-full max-w-[200px] rounded-xl object-contain" />
            <img src={Celu2} className="w-full max-w-[200px] rounded-xl object-contain" />
          </div>
        </div>


      {/* ===================================== */}
      {/* CLASES */}
      {/* ===================================== */}

      </div>
          <div className="w-full flex flex-col md:flex-row min-h-[450px]">
      {/* IMAGEN */}
      <div className="w-full md:w-1/2 h-64 md:h-auto">
        <img 
          src={Clases}
          alt="Gym"
          className="w-full h-full object-cover"
        />
      </div>

      {/* TEXTO */}
      <div className="w-full md:w-1/2 bg-orange text-white px-8 md:px-16 py-12 flex flex-col justify-center">
        
        {/* Línea  */}
        <div className="w-12 h-2 bg-orange-500 mb-4 rounded"></div>

        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-4">
        CLASES ILIMITADAS CON <br /> TU MEMBRESIA MEDIA O PREMIUM
        </h2>

        <p className="text-sm md:text-base text-gray-200 mb-8 leading-relaxed">
          Accedé a una amplia variedad de entrenamientos, elegí tus favoritos, reservá tu lugar y disfrutá de la experiencia completa del gimnasio sin límites.
        </p>

      </div>
    </div>

      {/* ===================================== */}
      {/* PLANES */}
      {/* ===================================== */}
      <div id="membership-info" className="py-10 bg-[#162232] dark:bg-gradient-to-r from-orange-600 to-orange-500">
       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mx-20">
          {plansList.map((plan, idx) => (
            <MembershipType
              key={plan.id}
              title={plan.nombre}
              img={[PlanBasico, PlanPremium, PlanIntermedio][idx]}
              descripcion={plan.descripcion}
              color={["purple", "yellow", "blue"][idx]}
              precio={plan.precio}
            />
          ))}
        </div>
      </div>

      {/* ===================================== */}
      {/* MAPA */}
      {/* ===================================== */}
      <div
        ref={infoRef}
        className={`w-full bg-[#162232] dark:bg-gray-900 py-16 px-6 shadow-inner ${visible ? "animate-fadeIn" : "opacity-0"}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          <div className={`flex-1 text-gray-200 ${visible ? "animate-fadeInLeft" : "opacity-0"}`}>
            <h3 className="text-2xl font-semibold mb-3">Dónde encontrarnos</h3>
            <p className="text-lg">Estamos ubicados en el centro de la ciudad.</p>
          </div>

          <div
            className={`flex-1 w-full h-64 md:h-72 rounded-xl overflow-hidden shadow-lg border border-gray-700 ${visible ? "animate-fadeInRight" : "opacity-0"}`}
          >
            <iframe
              title="Ubicación NukeGym"
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.773443017315!2d-58.381593684770326!3d-34.60368498045954!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzTCsDM2JzEzLjMiUyA1OMKwMjInNTguMSJX!5e0!3m2!1ses-419!2sar!4v1697040000000!"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;