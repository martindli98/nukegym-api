import React, { useEffect, useRef, useState } from "react";
import fondoGym from "../img/fondo.jpg";
import MembershipType from "../components/Membership/membershipType";

function Home() {
  const infoRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 } // se activa cuando 20% es visible
    );

    if (infoRef.current) {
      observer.observe(infoRef.current);
    }

    return () => {
      if (infoRef.current) observer.unobserve(infoRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col">
      {/* ✨ HERO - Pantalla completa */}
      <div
        className="h-screen bg-cover bg-center pb-20 flex items-center justify-center 
                   transition-colors duration-300 bg-gray-200 dark:bg-gray-900"
        style={{ backgroundImage: `url(${fondoGym})` }}
      >
        <div
          className="bg-black/60 dark:bg-black/70 backdrop-blur-sm px-8 py-10
                     rounded-xl text-center shadow-2xl max-w-lg border border-white/10
                     transform -translate-y-10 animate-fadeInUp"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenidos a <span className="text-orange-500">NukeGym</span>
          </h2>

          <p className="mt-3 text-lg text-gray-200 dark:text-gray-300 animate-fadeIn">
            Tu lugar para entrenar
          </p>
        </div>
      </div>

      {/* Sección informativa de Rutinas */}
      <div id="routine-info" className="py-20 bg-[#131c28] text-white">
        <h2 className="text-3xl font-bold mb-4">Rutinas</h2>
        <p className="text-lg">Información general para visitantes.</p>
      </div>

      {/* Sección informativa de Clases */}
      <div id="classes-info" className="py-20 bg-[#111a22] text-white">
        <h2 className="text-3xl font-bold mb-4">Clases</h2>
        <p className="text-lg">Horarios, tipos de clases, instructores, etc.</p>
      </div>

      <div id="membership-info" className="py-20 bg-[#162232] text-white">
        <h2 className="text-3xl font-bold mb-4">Nuestras Membresías</h2>
        <p className="text-lg">Detalles de los planes, beneficios, etc.</p>
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

      {/* ✨ INFO + MAPA - animación al hacer scroll */}
      <div
        ref={infoRef}
        className={`w-full bg-[#162232] dark:bg-gray-900 py-16 px-6 shadow-inner 
          ${visible ? "animate-fadeIn" : "opacity-0"}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-10 items-center">
          {/* Texto */}
          <div
            className={`flex-1 text-gray-200 
              ${visible ? "animate-fadeInLeft" : "opacity-0"}`}
          >
            <h3 className="text-2xl font-semibold mb-3">Dónde encontrarnos</h3>
            <p className="text-lg">
              Estamos ubicados en el centro de la ciudad, accesible y cómodo
              para todos.
            </p>
          </div>

          {/* Mapa */}
          <div
            className={`flex-1 w-full h-64 md:h-72 rounded-xl overflow-hidden shadow-lg 
              border border-gray-700 
              ${visible ? "animate-fadeInRight" : "opacity-0"}`}
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
