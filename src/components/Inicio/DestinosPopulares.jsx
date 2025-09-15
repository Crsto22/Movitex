const DestinosPopulares = () => {
  const destinos = [
    {
      id: 1,
      nombre: "Lima",
      imagen: "/src/img/lima.jpg",
      size: "large"
    },
    {
      id: 2,
      nombre: "Trujillo", 
      imagen: "/src/img/trujillo.jpg",
      size: "small"
    },
    {
      id: 3,
      nombre: "Cusco",
      imagen: "/src/img/cusco.jpg", 
      size: "small"
    },
    {
      id: 4,
      nombre: "Arequipa",
      imagen: "/src/img/huaraz.jpg",
      size: "small"
    }
  ];

  return (
    <section className="w-full py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-12">
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
           <span className="text-[#f0251f]">Destinos</span>  <span className="text-gray-800">populares</span>
          </h2>
        </div>

        {/* Grid de destinos - Desktop */}
        <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 gap-4 h-96">
          {/* Lima - Imagen grande (ocupa 2 columnas y 2 filas) */}
          <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer">
            <div 
              className="w-full h-full bg-cover bg-center bg-gray-300 transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://blog.incarail.com/wp-content/uploads/2024/10/FOTOS-Plaza-de-Armas-7.jpg')`
              }}
            >
              <div className="absolute bottom-4 left-4">
                <h3 
                  className="text-white text-2xl font-bold drop-shadow-lg"
                  style={{ fontFamily: 'MusticaPro, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  Lima
                </h3>
              </div>
            </div>
          </div>

          {/* Trujillo - Imagen pequeña (arriba derecha) */}
          <div className="col-span-2 row-span-1 relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer">
            <div 
              className="w-full h-full bg-cover bg-center bg-gray-300 transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://hips.hearstapps.com/hmg-prod/images/trujillo-1633528946.jpg')`
              }}
            >
              <div className="absolute bottom-3 left-3">
                <h3 
                  className="text-white text-xl font-bold drop-shadow-lg"
                  style={{ fontFamily: 'MusticaPro, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  Trujillo
                </h3>
              </div>
            </div>
          </div>

          {/* Cusco - Imagen pequeña (abajo izquierda) */}
          <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer">
            <div 
              className="w-full h-full bg-cover bg-center bg-gray-300 transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://blog.incarail.com/wp-content/uploads/2024/10/Catedral-de-Cusco.jpg')`
              }}
            >
              <div className="absolute bottom-3 left-3">
                <h3 
                  className="text-white text-lg font-bold drop-shadow-lg"
                  style={{ fontFamily: 'MusticaPro, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  Cusco
                </h3>
              </div>
            </div>
          </div>

          {/* Huaraz - Imagen pequeña (abajo derecha) */}
          <div className="col-span-1 row-span-1 relative group overflow-hidden rounded-2xl shadow-lg cursor-pointer">
            <div 
              className="w-full h-full bg-cover bg-center bg-gray-300 transition-transform duration-300 group-hover:scale-105"
              style={{ 
                backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://www.raptravelperu.com/wp-content/uploads/portada-arequipa.webp')`
              }}
            >
              <div className="absolute bottom-3 left-3">
                <h3 
                  className="text-white text-lg font-bold drop-shadow-lg"
                  style={{ fontFamily: 'MusticaPro, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                >
                  Arequipa
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Layout móvil - Grid de 2 filas y 2 columnas */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          {destinos.map((destino) => (
            <div 
              key={destino.id}
              className="relative group overflow-hidden rounded-xl shadow-lg cursor-pointer h-32 sm:h-36"
            >
              <div 
                className="w-full h-full bg-cover bg-center bg-gray-300 transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  backgroundImage: destino.nombre === 'Lima' 
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://blog.incarail.com/wp-content/uploads/2024/10/FOTOS-Plaza-de-Armas-7.jpg')`
                    : destino.nombre === 'Trujillo'
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://hips.hearstapps.com/hmg-prod/images/trujillo-1633528946.jpg')`
                    : destino.nombre === 'Cusco'
                    ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://blog.incarail.com/wp-content/uploads/2024/10/Catedral-de-Cusco.jpg')`
                    : `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('https://www.raptravelperu.com/wp-content/uploads/portada-arequipa.webp')`
                }}
              >
                <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                  <h3 
                    className="text-white text-sm sm:text-base font-bold drop-shadow-lg"
                    style={{ fontFamily: 'MusticaPro, sans-serif', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {destino.nombre}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinosPopulares;
