import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useViajes } from '../../context/ViajesContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DestinosDisponibles = () => {
  const { rutasUnicas, loadingRutas } = useViajes();
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  // Configuración del carrusel - responsive
  const itemsPerPage = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const totalSlides = Math.ceil(rutasUnicas.length / itemsPerPage);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Función para manejar la compra
  const handleComprar = (ruta) => {
    // Formatear fecha de yyyy-mm-dd a dd-mm-yyyy
    const [año, mes, dia] = ruta.fecha.split('-');
    const fechaFormateada = `${dia}-${mes}-${año}`;
    
    // Navegar a la página de pasajes con los parámetros
    navigate(`/pasajes-bus/${ruta.origen}/${ruta.destino}?fecha_salida=${fechaFormateada}`);
  };

  // Obtener las rutas visibles en el slide actual
  const startIndex = currentSlide * itemsPerPage;
  const visibleRutas = rutasUnicas.slice(startIndex, startIndex + itemsPerPage);

  if (loadingRutas) {
    return (
      <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-[#f0251f]" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            ¡Destinos que <span className='text-black'>tenemos ahora!</span>
          </h2>
          
          {/* Skeleton Loader */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-lg animate-pulse">
                {/* Skeleton Imagen */}
                <div className="w-full h-44 sm:h-48 md:h-56 bg-gray-200"></div>
                
                {/* Skeleton Contenido */}
                <div className="p-3 sm:p-4 md:p-6 text-center space-y-3">
                  {/* Skeleton Título */}
                  <div className="h-5 sm:h-6 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
                  
                  {/* Skeleton Subtítulo */}
                  <div className="h-4 bg-gray-200 rounded-full w-1/2 mx-auto"></div>
                  
                  {/* Skeleton Botón */}
                  <div className="h-8 sm:h-9 bg-gray-200 rounded-full w-28 sm:w-32 mx-auto mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (rutasUnicas.length === 0) {
    return null; // No mostrar nada si no hay rutas
  }

  return (
    <div className="py-8 sm:py-12 md:py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Título */}
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-[#f0251f]" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
          ¡Destinos que <span className='text-black'>tenemos ahora!</span>
        </h2>

        {/* Carrusel */}
        <div className="relative">
          {/* Botón Anterior - Solo en desktop */}
          {totalSlides > 1 && (
            <button
              onClick={handlePrevSlide}
              className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 xl:-translate-x-16 z-10 w-10 h-10 xl:w-12 xl:h-12 items-center justify-center bg-[#f0251f] rounded-full shadow-lg hover:bg-red-700 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
            </button>
          )}

          {/* Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out gap-3 sm:gap-4 md:gap-6"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {rutasUnicas.map((ruta, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)]"
                >
                  {/* Card */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all ">
                    {/* Imagen del destino */}
                    <div className="w-full h-44 sm:h-48 md:h-56 bg-gray-100 border-b-2 border-gray-200 overflow-hidden">
                      {ruta.imagen ? (
                        <img 
                          src={ruta.imagen} 
                          alt={`Imagen de ${ruta.destino}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-sm" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                            [Imagen de {ruta.destino}]
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="p-3 sm:p-4 md:p-6 text-center">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1 sm:mb-2 capitalize" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
                        Viaje a {ruta.destino}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 capitalize" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
                        Saliendo de {ruta.origen}
                      </p>
                      <button
                        onClick={() => handleComprar(ruta)}
                        className="bg-[#f0251f] cursor-pointer text-white px-5 sm:px-6 py-1.5 sm:py-2 rounded-full font-semibold hover:bg-red-700 active:scale-95 transition-all text-sm sm:text-base shadow-md"
                        style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
                      >
                        COMPRAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón Siguiente - Solo en desktop */}
          {totalSlides > 1 && (
            <button
              onClick={handleNextSlide}
              className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 xl:translate-x-16 z-10 w-10 h-10 xl:w-12 xl:h-12 items-center justify-center bg-[#f0251f] rounded-full shadow-lg hover:bg-red-700 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 xl:w-6 xl:h-6 text-white" />
            </button>
          )}
        </div>

        {/* Indicadores de paginación */}
        {totalSlides > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4 sm:mt-6 md:mt-8">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all ${
                  currentSlide === index
                    ? 'w-6 sm:w-8 h-2 sm:h-3 bg-[#f0251f] rounded-full'
                    : 'w-2 sm:w-3 h-2 sm:h-3 bg-gray-300 rounded-full hover:bg-[#f0251f] hover:opacity-50'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Botones móviles - Solo en móvil y tablet */}
        {totalSlides > 1 && (
          <div className="flex lg:hidden justify-center space-x-3 sm:space-x-4 mt-4 sm:mt-6">
            <button
              onClick={handlePrevSlide}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#f0251f] rounded-full shadow-md hover:bg-red-700 active:scale-95 transition-all"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
            <button
              onClick={handleNextSlide}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#f0251f] rounded-full shadow-md hover:bg-red-700 active:scale-95 transition-all"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DestinosDisponibles;
