import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MovitexLogo from '../assets/Contactos.png';
import { Phone, Mail, MessageCircle, MapPin } from 'lucide-react';

const Contactos = () => {
  const [activeTab, setActiveTab] = useState('pasajero');
  const [formData, setFormData] = useState({
    motivo: '',
    solicitud: '',
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    asunto: '',
    comentario: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Aquí se implementaría el envío del formulario
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-80 mt-16 flex items-center justify-center overflow-hidden">
        {/* Fondo con gradiente diagonal dividido */}
        <div className="absolute inset-0">
          {/* Sección izquierda - Amarillo Movitex */}
          <div className="absolute inset-0 bg-[#fab926]"></div>
          
          {/* Forma geométrica angular para dividir */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1620 320" preserveAspectRatio="xMidYMid slice">
              <defs>
                <linearGradient id="rightGradientContact" x1="10%" y1="10%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
              </defs>
              <polygon 
                points="1200,0 1920,0 1920,320 800,320" 
                fill="url(#rightGradientContact)"
              />
            </svg>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-6 items-center h-full">
            
            {/* Sección izquierda - Texto (7 columnas) */}
            <div className="lg:col-span-7 text-center lg:text-left">
              {/* Título principal */}
              <div className="mb-6">
                <h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  Contáctanos
                </h1>
                <p className="text-sm md:text-base lg:text-lg text-white font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 drop-shadow-lg">
                  Estamos aquí para ayudarte con todas tus consultas y solicitudes de viaje.
                </p>
              </div>
            </div>

            {/* Sección derecha - Logo (5 columnas) */}
            <div className="lg:col-span-5 relative">
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <img 
                  src={MovitexLogo} 
                  alt="Movitex Logo" 
                  className=" w-full drop-shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Contenido Principal */}
      <section className="py-16 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Información de Contacto */}
            <div className="lg:col-span-1">
              <div className=" p-8">
                <h3 
                  className="text-2xl font-bold text-gray-900 mb-8"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  Información de Contacto
                </h3>
                
                <div className="space-y-6">
                  {/* Teléfono */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#fab926] rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Teléfono</h4>
                      <p className="text-gray-600">+51 418-111</p>
                    </div>
                  </div>

                  {/* Correo Electrónico */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-[#f0251f] rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Correo Electrónico</h4>
                      <p className="text-gray-600">contacto@movitex.com.pe</p>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">WhatsApp</h4>
                      <p className="text-gray-600">+51 996 658 043</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de Contacto */}
            <div className="lg:col-span-2">
              <div className="bg-[#f0251f] rounded-2xl shadow-lg p-8">
                <h3 
                  className="text-2xl font-bold text-white mb-8 text-center"
                  style={{ fontFamily: 'MusticaPro, sans-serif' }}
                >
                  Contáctanos
                </h3>

                {/* Pestañas */}
                <div className="flex mb-8 bg-white rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('pasajero')}
                    className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-300 ${
                      activeTab === 'pasajero'
                        ? 'bg-[#fab926] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Soy pasajero
                  </button>
                  <button
                    onClick={() => setActiveTab('empresa')}
                    className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all duration-300 ${
                      activeTab === 'empresa'
                        ? 'bg-[#fab926] text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                    style={{ fontFamily: 'MusticaPro, sans-serif' }}
                  >
                    Soy empresa
                  </button>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Primera fila - Motivo y Solicitud */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block text-sm font-semibold text-white mb-2">
                        Motivo
                      </label>
                      <select
                        name="motivo"
                        value={formData.motivo}
                        onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      >
                        <option value="">Seleccionar motivo</option>
                        <option value="consulta">Consulta</option>
                        <option value="reclamo">Reclamo</option>
                        <option value="sugerencia">Sugerencia</option>
                        <option value="reserva">Reserva</option>
                      </select>
                    </div>
                    <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                          Solicitud
                      </label>
                      <select
                        name="solicitud"
                        value={formData.solicitud}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      >
                        <option value="">Seleccionar solicitud</option>
                        <option value="informacion">Información</option>
                        <option value="reserva">Reserva</option>
                        <option value="cancelacion">Cancelación</option>
                        <option value="cambio">Cambio de fecha</option>
                      </select>
                    </div>
                  </div>

                  {/* Segunda fila - Nombre y Apellido */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        placeholder="Ingresa tu nombre"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      />
                    </div>
                    <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                        Apellido
                      </label>
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        placeholder="Ingresa tu apellido"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Tercera fila - Teléfono y Correo */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        placeholder="Ingresa tu teléfono"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      />
                    </div>
                    <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                        placeholder="Ingresa tu correo"
                        required
                        style={{ fontFamily: 'MusticaPro, sans-serif' }}
                      />
                    </div>
                  </div>

                  {/* Asunto */}
                  <div>
                    <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                      Asunto
                    </label>
                    <input
                      type="text"
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleInputChange}
                                              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300"
                      placeholder="Ingresa el asunto"
                      required
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    />
                  </div>

                  {/* Comentario */}
                  <div>
                  <label style={{ fontFamily: 'MusticaPro, sans-serif' }} className="block  font-semibold text-white mb-2">
                  Ingresa tu comentario
                    </label>
                    <textarea
                      name="comentario"
                      value={formData.comentario}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fab926] focus:border-transparent transition-all duration-300 resize-none"
                      placeholder="Escribe tu comentario aquí..."
                      required  
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    />
                  </div>

                  {/* Botón de Envío */}
                  <div className="text-center pt-4">
                    <button
                      type="submit"
                      className="bg-[#fab926]  text-white px-12 py-4 rounded-lg font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                      style={{ fontFamily: 'MusticaPro, sans-serif' }}
                    >
                      ENVIAR
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contactos;
