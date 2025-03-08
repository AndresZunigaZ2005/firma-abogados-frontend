import React from "react";
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import banner_home from '../assets/images/banner_home.jpg';
import shakehands from '../assets/images/shakehands.png'; // Imagen para el servicio 1
import job from '../assets/images/job.png'; // Imagen para el servicio 2
import court from '../assets/images/court.png'; // Imagen para el servicio 3
import './Home.css'; // Asegúrate de importar el archivo CSS

const Home = () => {
  return (
    <div className="home">
      {/* Banner responsivo */}
      <div className="banner">
        <ResponsiveLazyImage
          imagePath={banner_home}
          altText="Banner de La Ley del Hielo"
          size="banner"
        />
        <div className="banner-text">
          <h1>Bienvenidos a La Ley del Hielo</h1>
          <p>Expertos en soluciones legales con integridad y excelencia.</p>
        </div>
      </div>

      {/* Sección de Nuestra Historia */}
      <div className="historia">
        <div className="texto-historia">
          <h1>Nuestra Historia</h1>
          <p>
            En La Ley del Hielo, creemos en la justicia como pilar fundamental de la sociedad.
            Nuestra firma nació con la misión de brindar asesoría y representación legal con
            integridad, compromiso y excelencia. Con años de experiencia en el sector jurídico,
            hemos construido un equipo de abogados especializados en diversas ramas del
            derecho, siempre enfocados en ofrecer soluciones efectivas a nuestros clientes.
          </p>
        </div>
      </div>

      {/* Sección de Servicios */}
      <div className="servicios">
        <h2>Nuestros Servicios</h2>
        <div className="servicios-lista">
          {/* Servicio 1 */}
          <div className="servicio">
            <ResponsiveLazyImage
              imagePath={shakehands}
              altText="Servicio de Derecho Civil"
              size="medium"
            />
            <h3>Derecho Civil</h3>
            <p>
              Ofrecemos asesoría y representación en casos de derecho civil, incluyendo contratos,
              propiedad, responsabilidad civil y más.
            </p>
          </div>

          {/* Servicio 2 */}
          <div className="servicio">
            <ResponsiveLazyImage
              imagePath={job}
              altText="Servicio de Derecho Laboral"
              size="medium"
            />
            <h3>Derecho Laboral</h3>
            <p>
              Defendemos los derechos de los trabajadores y empleadores en casos de despidos,
              contratos, acoso laboral y más.
            </p>
          </div>

          {/* Servicio 3 */}
          <div className="servicio">
            <ResponsiveLazyImage
              imagePath={court}
              altText="Servicio de Derecho Penal"
              size="medium"
            />
            <h3>Derecho Penal</h3>
            <p>
              Brindamos defensa legal en casos penales, asegurando un proceso justo y transparente
              para nuestros clientes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;