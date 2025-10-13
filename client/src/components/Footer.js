import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer 
      className="py-10 
                 bg-white text-gray-800           // modo claro por defecto
                 dark:bg-[oklch(12.9%_0.042_264.695)] dark:text-white" // modo oscuro
    >
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        
        {/* Logo o nombre del sitio */}
        <div>
            <h2 className="text-2xl font-bold mb-4">Mi Sitio Web</h2>
            <p className="text-gray-600 dark:text-purple-200">
                Tu lugar para entrenar 🚀
            </p>
        </div>

        {/* Links de navegación */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-2">
                <li><a href="/" className="hover:underline">Inicio</a></li>
                <li><a href="/about" className="hover:underline">Sobre nosotros</a></li>
                <li><a href="/contact" className="hover:underline">Contacto</a></li>
                <li><a href="/faq" className="hover:underline">Preguntas frecuentes</a></li>
            </ul>
        </div>

        {/* Sugerencias y contribuciones */}
        <div>
            <h3 className="text-xl font-semibold mb-4">Sugerencias y Contribuciones</h3>
            <p className="text-gray-600 dark:text-purple-200 mb-4">
                ¿Tenés una queja o una idea para mejorar?  
                ¡Contanos, tu opinión nos ayuda a crecer! 💡
            </p>
            
            <Link
              to="/feedback"
              className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg inline-block font-semibold text-white"
            >
               Enviar feedback
            </Link>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-300 dark:border-purple-700 mt-8 pt-4 text-center text-gray-500 dark:text-purple-300">
        <p>&copy; {new Date().getFullYear()} Mi Sitio Web. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
