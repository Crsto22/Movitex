import { X, Download } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase/supabase';
import { pdf } from '@react-pdf/renderer';
import BoletaPDF from './BoletaPDF';
import toast from 'react-hot-toast';

const BoletaModal = ({ isOpen, onClose, idReserva }) => {
  const modalRef = useRef(null);
  const [datosBoleta, setDatosBoleta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (idReserva) {
        cargarBoleta();
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, idReserva]);

  const cargarBoleta = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Llamar a la función RPC generar_boleta_viaje
      const { data, error: errorBoleta } = await supabase
        .rpc('generar_boleta_viaje', { p_id_reserva: idReserva });

      if (errorBoleta) {
        console.error('Error al generar boleta:', errorBoleta);
        setError('Error al cargar la boleta');
        return;
      }

      console.log('Boleta cargada:', data);
      
      // Estructurar los datos para el componente
      setDatosBoleta({
        id_reserva: idReserva,
        pasajeros: data || []
      });
    } catch (err) {
      console.error('Error inesperado:', err);
      setError('Error inesperado al cargar la boleta');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargarPDF = async () => {
    if (!datosBoleta || !datosBoleta.pasajeros || datosBoleta.pasajeros.length === 0) {
      toast.error('No hay datos de boleta para descargar');
      return;
    }

    try {
      toast.loading('Generando PDF...');
      
      // Generar el PDF
      const blob = await pdf(
        <BoletaPDF 
          pasajeros={datosBoleta.pasajeros} 
          idReserva={datosBoleta.id_reserva} 
        />
      ).toBlob();

      // Crear URL del blob y descargar
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Boleta_Movitex_${datosBoleta.id_reserva?.slice(-8).toUpperCase()}.pdf`;
      link.click();
      
      // Limpiar
      URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.dismiss();
      toast.error('Error al generar el PDF');
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#f0251f] mx-auto mb-4"></div>
          <p className="text-gray-600" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            Cargando boleta...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'MusticaPro, sans-serif' }}>
            Error al cargar boleta
          </h3>
          <p className="text-gray-600 mb-4" style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}>
            {error}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-colors font-medium"
            style={{ fontFamily: 'MusticaPro, sans-serif' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!datosBoleta || !datosBoleta.pasajeros || datosBoleta.pasajeros.length === 0) {
    return null;
  }

  // Función para generar URL del código QR
  const generarQRCode = (id_boleto) => {
    const qrData = encodeURIComponent(id_boleto);
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=ffffff&color=000000`;
  };

  // Función para convertir números a letras (simplificada)
  const convertirNumeroALetras = (numero) => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
    
    if (numero === 0) return 'CERO';
    if (numero === 100) return 'CIEN';
    
    let resultado = '';
    
    if (numero >= 100) {
      resultado += centenas[Math.floor(numero / 100)] + ' ';
      numero %= 100;
    }
    
    if (numero >= 20) {
      resultado += decenas[Math.floor(numero / 10)];
      if (numero % 10 !== 0) {
        resultado += ' Y ' + unidades[numero % 10];
      }
    } else if (numero >= 10) {
      const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
      resultado += especiales[numero - 10];
    } else if (numero > 0) {
      resultado += unidades[numero];
    }
    
    return resultado.trim();
  };

  const fechaActual = new Date().toLocaleDateString('es-PE');
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });

  // Renderizar cada boleta de pasajero
  const renderBoleta = (pasajero, index) => {
    const totalImporte = parseFloat(pasajero.precio || 0);
    
    return (
      <div 
        key={index} 
        className="bg-white p-6 mb-8 last:mb-0"
        style={{ pageBreakAfter: index < datosBoleta.pasajeros.length - 1 ? 'always' : 'auto' }}
      >
        {/* Header */}
        <table className="w-full text-left text-[10px] mb-4">
          <tbody>
            <tr>
              <td className="w-[60%]">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="text-2xl font-bold">MOVITEX</td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="w-[40%] text-center">
                <img 
                  className="w-1/2 mx-auto" 
                  src="https://www.movitexgroup.tech/assets/Logo-DQSFG36w.png" 
                  alt="Logo"
                />
              </td>
            </tr>
            <tr>
              <td className="w-[60%]">
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td>Télf.: 999999999</td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>Agencia de Venta: Movitex</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </td>
              <td className="w-[40%]">
                <br />
                <table className="w-full border border-black text-center font-bold">
                  <tbody>
                    <tr>
                      <td className="w-full text-[9px]"><br /></td>
                    </tr>
                    <tr>
                      <td>BOLETA DE VENTA ELECTRONICA</td>
                    </tr>
                    <tr>
                      <td className="text-[9px]">
                        {datosBoleta.id_reserva?.slice(-8).toUpperCase()}
                        <br /><br />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Información del Cliente */}
        <table className="w-full border border-black text-left text-[11px] p-1 mb-2">
          <tbody>
            <tr>
              <td className="w-[20%]"><strong>SEÑOR(ES)</strong></td>
              <td className="w-[50%]">: {pasajero.nombres} {pasajero.apellidos}</td>
              <td className="w-[15%]">&nbsp;</td>
              <td className="w-[15%]">&nbsp;</td>
            </tr>
            <tr>
              <td className="w-[20%]"><strong>DOCUMENTO: </strong></td>
              <td className="w-[50%]">: {pasajero.dni}</td>
              <td className="w-[15%]">&nbsp;</td>
              <td className="w-[15%]">&nbsp;</td>
            </tr>
            <tr>
              <td className="w-[20%]"><strong>DIRECCIÓN</strong></td>
              <td className="w-[50%]">: - </td>
              <td className="w-[15%]"><strong>FECHA EMISIÓN</strong></td>
              <td className="w-[15%]">: {fechaActual} {horaActual}</td>
            </tr>
            <tr>
              <td className="w-[20%]"><strong>CONDICIÓN DE PAGO</strong></td>
              <td className="w-[50%]">: Contado</td>
              <td className="w-[15%]"><strong>MONEDA</strong></td>
              <td className="w-[15%]">: SOLES </td>
            </tr>
          </tbody>
        </table>

        <table className="w-full border border-white text-left text-[11px] p-1 mb-2">
          <tbody>
            <tr>
              <td className="w-[20%]"><strong>TIPO</strong></td>
              <td className="w-[80%]">: -</td>
            </tr>
          </tbody>
        </table>

        {/* Encabezado de tabla */}
        <table className="w-full text-center text-[11px]">
          <tbody>
            <tr>
              <th className="w-[20%] border border-black py-2 px-1">Cantidad</th>
              <th className="w-[50%] border-r border-t border-b border-black py-2 px-1">Descripción</th>
              <th className="w-[15%] border-r border-t border-b border-black py-2 px-1">P. Unitario</th>
              <th className="w-[15%] border-r border-t border-b border-black py-2 px-1">Total</th>
            </tr>
          </tbody>
        </table>

        {/* Detalles de la boleta */}
        <table className="w-full text-center text-[11px]">
          <tbody>
            <tr>
              <td className="w-[20%] text-center p-1 border-r border-l border-black"> 1 </td>
              <td className="w-[50%] text-left p-1 border-r border-black whitespace-pre-line">
                FECHA VIAJE: {pasajero.fecha}
                <br />HORA DE VIAJE: {pasajero.hora_salida}
                <br />ASIENTO: {pasajero.numero_asiento}
                <br />PISO: {pasajero.piso}
                <br />SERVICIO: {pasajero.tipo_servicio?.toUpperCase()}
                <br />PASAJERO: {pasajero.nombres} {pasajero.apellidos}
                <br />ORIGEN: {pasajero.origen} - DESTINO: {pasajero.destino}
              </td>
              <td className="w-[15%] text-right p-1 border-r border-black">S/. {pasajero.precio}</td>
              <td className="w-[15%] text-right p-1 border-r border-black">S/. {pasajero.precio}</td>
            </tr>
          </tbody>
        </table>

        {/* Totales */}
        <table className="w-full text-center text-[11px] border-t border-black">
          <tbody>
            <tr>
              <td 
                rowSpan="7" 
                className="w-[70%] text-left border-r border-black align-middle p-1"
              >
                <strong>SON : </strong>{convertirNumeroALetras(totalImporte)} 00/100 SOLES.
              </td>
            </tr>
            <tr>
              <td className="w-[15%] text-left border-r border-b border-black p-1">Importe Total : </td>
              <td className="w-[15%] text-right border-r border-b border-black p-1">S/. {totalImporte.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer con QR */}
        <table className="w-full text-center text-[10px] py-2 align-middle">
          <tbody>
            <tr>
              <td className="w-[70%] text-left align-middle">
                <strong>¡Gracias por viajar con Movitex!</strong><br />
                Por favor, presente esta boleta al momento del embarque.<br />
                <small>Código de Reserva: {datosBoleta.id_reserva}</small><br />
                <small>ID Boleto: {pasajero.id_boleto}</small>
              </td>
              <td className="w-[30%] text-center align-middle">
                <img 
                  src={generarQRCode(pasajero.id_boleto)} 
                  alt="QR Code" 
                  className="w-[100px] h-[100px] border border-gray-300 mx-auto"
                />
                <small><strong>Escanea para verificar</strong></small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header del modal */}
        <div className="relative p-4 sm:p-6 border-b border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <X size={20} className="text-gray-500" />
          </button>
          
          <div className="flex items-center justify-between pr-12">
            <div>
              <h2 
                className="text-xl sm:text-2xl font-bold text-gray-800"
                style={{ fontFamily: 'MusticaPro, sans-serif' }}
              >
                Boleta de Viaje
              </h2>
              <p 
                className="text-sm text-gray-600 mt-1"
                style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
              >
                {datosBoleta?.pasajeros?.length > 1 
                  ? `${datosBoleta.pasajeros.length} Boletas - ${datosBoleta.pasajeros.length} Pasajeros`
                  : '1 Boleta - 1 Pasajero'
                }
              </p>
            </div>
            
            <button
              onClick={handleDescargarPDF}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-colors font-medium"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              <Download size={18} />
              <span>Descargar PDF</span>
            </button>
          </div>
        </div>

        {/* Contenido del modal - Boletas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto">
            {datosBoleta?.pasajeros?.map((pasajero, index) => renderBoleta(pasajero, index))}
          </div>
        </div>

        {/* Footer del modal */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <p 
            className="text-sm text-gray-600"
            style={{ fontFamily: 'Inter_18pt-Medium, sans-serif' }}
          >
            Reserva: {datosBoleta?.id_reserva?.slice(-8).toUpperCase()}
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleDescargarPDF}
              className="sm:hidden flex items-center gap-2 px-4 py-2 bg-[#f0251f] text-white rounded-lg hover:bg-[#d91f1a] transition-colors font-medium text-sm"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              <Download size={16} />
              <span>Descargar PDF</span>
            </button>
            
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm"
              style={{ fontFamily: 'MusticaPro, sans-serif' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>


    </div>
  );
};

export default BoletaModal;
