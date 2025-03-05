import React from 'react';
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage'; // Asegúrate de que la ruta sea correcta
import mision from '../assets/images/mision.png';
import vision from '../assets/images/vision.png';
import objetivos from '../assets/images/objetivos.png';
import './About.css'; // Archivo de estilos para esta sección

const About = () => {
    return (
      <div className="sobre-nosotros">
        {/* Misión */}
        <div className="seccion">
          <ResponsiveLazyImage
            imagePath={mision}
            altText="Misión de La Ley del Hielo"
            size="large"
          />
          <div className="texto">
            <h2>Misión</h2>
            <p>
              En La Ley del Hielo, nos comprometemos a brindar asesoría y representación legal con ética,
              transparencia y excelencia. Defendemos los derechos de nuestros clientes con estrategias
              efectivas y personalizadas, garantizando justicia y protección en cada caso. Nuestro objetivo es
              ofrecer soluciones legales confiables, con un equipo altamente capacitado que actúa con
              integridad y compromiso.
            </p>
          </div>
        </div>
  
        {/* Visión */}
        <div className="seccion">
          <div className="texto">
            <h2>Visión</h2>
            <p>
              Para el 2030, ser reconocidos como una firma de abogados líder a nivel nacional, destacándonos
              por nuestra profesionalidad, innovación y resultados. Aspiramos a construir una sociedad
              más justa a través del ejercicio responsable del derecho, estableciendo relaciones de confianza
              con nuestros clientes y promoviendo la excelencia en la práctica legal.
            </p>
          </div>
          <ResponsiveLazyImage
            imagePath={vision}
            altText="Visión de La Ley del Hielo"
            size="large"
          />
        </div>
  
        {/* Objetivos */}
        <div className="seccion">
          <ResponsiveLazyImage
            imagePath={objetivos}
            altText="Objetivos de La Ley del Hielo"
            size="large"
          />
          <div className="texto">
            <h2>Objetivos</h2>
            <ul>
              <li>Brindar asesoría y representación legal de alta calidad, enfocándonos en la satisfacción y seguridad jurídica de nuestros clientes.</li>
              <li>Mantener un equipo de abogados altamente capacitado, actualizado en las últimas tendencias y cambios legislativos.</li>
              <li>Garantizar la ética y transparencia en cada caso, actuando con responsabilidad y compromiso en la defensa de los derechos.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };
  
  export default About;