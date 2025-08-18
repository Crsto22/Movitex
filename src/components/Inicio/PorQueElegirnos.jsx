import { Star, Armchair, Truck, MapPin } from 'lucide-react';

const PorQueElegirnos = () => {
  const caracteristicas = [
    {
      id: 1,
      icono: Star,
      titulo: "44 Años Creando",
      descripcion: "las mejores experiencias de viaje"
    },
    {
      id: 2,
      icono: Armchair,
      titulo: "Asientos ergonómicos",
      descripcion: "con diferentes grados de inclinación"
    },
    {
      id: 3,
      icono: Truck,
      titulo: "Flota moderna",
      descripcion: "y de última generación"
    },
    {
      id: 4,
      icono: MapPin,
      titulo: "Control GPS",
      descripcion: "y cambio de choferes cada 4 horas"
    }
  ];

  return (
    <section className="w-full py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            <span className="text-[#f0251f]">¿Por qué</span>{' '}
            <span className="text-gray-800">elegirnos?</span>
          </h2>
        </div>

        {/* Grid de características */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {caracteristicas.map((item) => {
            const IconComponent = item.icono;
            return (
              <div key={item.id} className="flex flex-col items-center text-center group">
                {/* Círculo con ícono */}
                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mb-6 group-hover:shadow-xl transition-shadow duration-300">
                  <IconComponent className="w-10 h-10 text-[#f0251f]" />
                </div>
                
                {/* Título */}
                <h3 
                  className="text-xl font-bold text-gray-800 mb-3"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  {item.titulo}
                </h3>
                
                {/* Descripción */}
                <p className="text-gray-600 text-base leading-relaxed max-w-xs">
                  {item.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnos;
