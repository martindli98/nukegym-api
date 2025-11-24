import React, { useEffect, useRef, useState } from "react";
import fondoGym from "../img/fondo.jpg";
import MembershipType from "../components/Membership/membershipType";
import Rutina from "../img/home/Rutina.png";
import Progreso from "../img/home/Progreso.png";
import ArmarRutina from "../img/home/ArmarRutina.png"
import Clases from "../img/home/Clases.png"

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

  useEffect(() => {
    const elements = document.querySelectorAll(".animate-on-scroll");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const anim = entry.target.dataset.anim;
            entry.target.classList.add(anim);
            entry.target.classList.add("opacity-100");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col">
      {/* ✨ HERO - Pantalla completa */}
      <div
        id="inicio-info"
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
        <div
          id="rutine-info"
          className="w-full max-w-5xl mx-auto py-16 flex flex-col text-white gap-24"
        >
          {/* Bloque 1 */}
          <div className="flex justify-between items-center gap-10">
            <div
              className="flex items-center justify-center font-bold animate-on-scroll opacity-0 rounded-md border border-gray-200"
              data-anim="animate-fadeInLeft"
            >
              <img
                src={Rutina}
                alt="Imagen de rutina"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div
              className="animate-on-scroll opacity-0"
              data-anim="animate-fadeInRight"
            >
              <p
                className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl"
              >
                Rutinas personalizadas para que sepas exactamente qué entrenar
                cada día.
              </p>
            </div>
          </div>

          {/* Bloque 2 */}
          <div className="flex justify-between items-center gap-10 flex-row-reverse ">
            <div
              className="flex items-center justify-center font-bold animate-on-scroll opacity-0 rounded-md border border-gray-200"
              data-anim="animate-fadeInRight"
            >
              <img
                src={Progreso}
                alt="Imagen de progreso"
                className="w-full h-full object-contain rounded-md"
              />
            </div>

            <div
              className="animate-on-scroll opacity-0"
              data-anim="animate-fadeInLeft"
            >
              <p
                className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl"
              >
                Registro de progreso con anotaciones de peso, repeticiones y
                mejoras para llevar un seguimiento real de tus avances.
              </p>
            </div>
          </div>

          {/* Bloque 3 */}
          <div className="flex justify-between items-center gap-10 ">
            <div
              className="flex items-center justify-center font-bold animate-on-scroll opacity-0 rounded-md border border-gray-200"
              data-anim="animate-fadeInLeft"
            >
              <img
                src={ArmarRutina}
                alt="Imagen de armado de rutina"
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <div
              className="animate-on-scroll opacity-0"
              data-anim="animate-fadeInRight"
            >
              <p
                className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl"
              >
                Amplio catálogo de ejercicios con filtros para armar la rutina
                que mejor se adapte a tus objetivos.
              </p>
            </div>
          </div>

          {/* Bloque 4 */}
          <div className="flex justify-between items-center gap-10 flex-row-reverse ">
            <div
              className="w-[300px] h-[200px] border-4 border-black flex items-center justify-center font-bold animate-on-scroll opacity-0"
              data-anim="animate-fadeInRight"
            >
              IMAGEN DE APP TERMINADA
            </div>
            <div
              className="animate-on-scroll opacity-0"
              data-anim="animate-fadeInLeft"
            >
              <p
                className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl"
              >
                Seguimiento fácil y rápido de tu rutina directamente desde la
                app móvil.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Sección informativa de Clases */}
      <div
        id="classes-info"
        className="w-full max-w-5xl mx-auto py-16 flex flex-col text-white gap-24"
      >
        <div className="flex justify-between items-center gap-10 ">
          <div
            className="flex items-center justify-center font-bold animate-on-scroll opacity-0 rounded-md border border-gray-200"
            data-anim="animate-fadeInLeft"
          >
            <img
                src={Clases}
                alt="Imagen de reserva de clases"
                className="w-full h-full object-contain rounded-md"
              />
          </div>
          <div
            className="animate-on-scroll opacity-0"
            data-anim="animate-fadeInRight"
          >
            <p
              className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl animate-fadeInRight"
            >
              Si contás con una membresía Intermedia o Premium, vas a poder disfrutar de todas nuestras clases grupales.
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center gap-10 flex-row-reverse ">
          <div
            className="w-[300px] h-[200px] border-4 border-black flex items-center justify-center font-bold animate-on-scroll opacity-0"
            data-anim="animate-fadeInRight"
          >
            IMAGEN CLASES APP
          </div>
          <div
            className="animate-on-scroll opacity-0"
            data-anim="animate-fadeInLeft"
          >
            <p
              className="w-[400px] h-[200px] bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 
        rounded-3xl shadow-xl p-8 
        flex items-center text-center gap-4
        transition-all duration-300
        hover:-translate-y-2 hover:shadow-2xl"
            >
              Seguimiento fácil y rápido de fecha y horario de tus clases desde la app
              móvil.
            </p>
          </div>
        </div>
      </div>

      <div id="membership-info" className="py-20 bg-[#162232]">
        <div className="w-full h-px bg-gray-300 dark:bg-gray-700 my-6 pa" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mx-12">
          <MembershipType
            title="Plan Básico"
            img="/img/basic.png"
            descripcion="Acceso al gimnasio en horario estándar. Ideal para quienes comienzan."
            color="purple"
            precio=" 15.000"
          />
          <MembershipType
            title="Plan Premium"
            img="/img/premium.png"
            descripcion="Acceso completo, entrenador personal y seguimiento avanzado."
            color="yellow"
            precio=" 75.000"
          />

          <MembershipType
            title="Plan Intermedio"
            img="/img/intermedio.png"
            descripcion="Incluye rutinas personalizadas y asesoramiento mensual."
            color="blue"
            precio=" 40.000"
          />
        </div>
      </div>
      <div>EMPEZA A ENTRENAR CON NOSOTROS</div>
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
