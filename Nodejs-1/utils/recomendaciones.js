
const calcularPuntuacionRecomendacion = (recomendacion) => {
  return recomendacion.likes || 0;
};

const ordenarRecomendaciones = (recomendaciones) => {
  return recomendaciones.sort((a, b) => 
    calcularPuntuacionRecomendacion(b) - calcularPuntuacionRecomendacion(a)
  );
};

module.exports = {
  calcularPuntuacionRecomendacion,
  ordenarRecomendaciones
};
