import React from 'react';
import './ResponsiveLazyImage.css'; // Archivo de estilos para los tamaños

const ResponsiveLazyImage = ({ imagePath, altText, size = 'medium' }) => {
  // Si imagePath es un objeto (por la importación), accede a la propiedad `default`
  const imageSrc = typeof imagePath === 'object' ? imagePath.default : imagePath;

  return (
    <div className={`responsive-image ${size}`}>
      <img
        src={imageSrc} // Usa la ruta correcta de la imagen
        alt={altText}
        loading="lazy"
      />
    </div>
  );
};

export default ResponsiveLazyImage;