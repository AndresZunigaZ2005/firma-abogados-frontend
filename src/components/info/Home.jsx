import React from "react";
import ResponsiveLazyImage from '../assets/support/ResponsiveLazyImage';
import banner_home from '../assets/images/banner_home.jpg';
import './Home.css'; // Asegúrate de importar el archivo CSS

const Home = () => {
  return (
    <div className="home">
      {/* Sección de Nuestra Historia */}
      <div className="historia">
        <div className="imagen-historia">
          <ResponsiveLazyImage
            imagePath={banner_home}
            altText="Nuestra Historia"
            size="banner"
          />
        </div>
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
    </div>
  );
};

export default Home;