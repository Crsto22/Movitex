import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Función para convertir números a letras
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

// Función para generar URL del código QR
const generarQRCode = (id_boleto) => {
  const qrData = encodeURIComponent(id_boleto);
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=ffffff&color=000000`;
};

// Estilos para el PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  // Header
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  headerLeft: {
    width: '60%',
  },
  headerRight: {
    width: '40%',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    marginBottom: 2,
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 5,
    objectFit: 'contain',
  },
  boletaBox: {
    border: '1px solid black',
    padding: 5,
    textAlign: 'center',
  },
  boletaTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 5,
  },
  boletaId: {
    fontSize: 9,
    marginBottom: 5,
  },
  // Cliente Info
  clienteTable: {
    border: '1 solid black',
    marginTop: 10,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    fontSize: 10,
    borderBottom: '1 solid black',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableRowLast: {
    flexDirection: 'row',
    fontSize: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  labelCell: {
    width: '22%',
    fontWeight: 'bold',
  },
  valueCell: {
    width: '43%',
  },
  smallLabelCell: {
    width: '20%',
    fontWeight: 'bold',
    textAlign: 'right',
    paddingRight: 5,
  },
  smallValueCell: {
    width: '15%',
  },
  // Tipo
  tipoTable: {
    borderLeft: '1 solid black',
    borderRight: '1 solid black',
    borderBottom: '1 solid black',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tipoRow: {
    flexDirection: 'row',
    fontSize: 10,
  },
  // Encabezado de tabla de productos
  tableHeader: {
    flexDirection: 'row',
    border: '1 solid black',
    backgroundColor: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  headerCell: {
    textAlign: 'center',
  },
  headerCell10: {
    width: '10%',
  },
  headerCell60: {
    width: '60%',
  },
  headerCell15: {
    width: '15%',
  },
  // Fila de detalles
  detailsRow: {
    flexDirection: 'row',
    borderLeft: '1 solid black',
    borderRight: '1 solid black',
    borderBottom: '1 solid black',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  detailCell10: {
    width: '10%',
    textAlign: 'center',
    fontSize: 10,
    paddingTop: 30,
  },
  detailCell60: {
    width: '60%',
    paddingLeft: 8,
    fontSize: 9,
    lineHeight: 1.4,
  },
  detailCell15: {
    width: '15%',
    textAlign: 'right',
    paddingRight: 8,
    fontSize: 10,
    paddingTop: 30,
  },
  // Totales
  totalesContainer: {
    flexDirection: 'row',
    border: '1 solid black',
    fontSize: 10,
  },
  totalesLeft: {
    width: '70%',
    borderRight: '1 solid black',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  totalesRight: {
    width: '30%',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    textAlign: 'right',
  },
  // Footer
  footerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    padding: 5,
    fontSize: 10,
  },
  footerLeft: {
    width: '70%',
    paddingRight: 10,
  },
  footerRight: {
    width: '30%',
    alignItems: 'center',
  },
  qrCode: {
    width: 100,
    height: 100,
    marginBottom: 5,
  },
  footerTitle: {
    fontWeight: 'bold',
    marginBottom: 3,
  },
  footerText: {
    fontSize: 9,
    marginBottom: 2,
  },
  smallText: {
    fontSize: 8,
  },
});

// Componente de página individual para cada pasajero
const BoletaPaginaPDF = ({ pasajero, idReserva }) => {
  const fechaActual = new Date().toLocaleDateString('es-PE');
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  const totalImporte = parseFloat(pasajero.precio || 0);

  return (
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <Text style={styles.companyName}>MOVITEX</Text>
          <Text style={styles.companyInfo}>Télf.: 999999999</Text>
          <Text style={styles.companyInfo}>Agencia de Venta: Movitex</Text>
        </View>
        <View style={styles.headerRight}>
          <Image 
            style={styles.logo}
            src="https://www.movitexgroup.tech/assets/Logo-DQSFG36w.png"
          />
          <View style={styles.boletaBox}>
            <Text style={styles.boletaTitle}>BOLETA DE VENTA ELECTRONICA</Text>
            <Text style={styles.boletaId}>{idReserva?.slice(-8).toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Información del Cliente */}
      <View style={styles.clienteTable}>
        <View style={styles.tableRow}>
          <Text style={styles.labelCell}>SEÑOR(ES)</Text>
          <Text style={styles.valueCell}>: {pasajero.nombres} {pasajero.apellidos}</Text>
          <Text style={styles.smallLabelCell}></Text>
          <Text style={styles.smallValueCell}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.labelCell}>DOCUMENTO:</Text>
          <Text style={styles.valueCell}>: {pasajero.dni}</Text>
          <Text style={styles.smallLabelCell}></Text>
          <Text style={styles.smallValueCell}></Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.labelCell}>DIRECCIÓN</Text>
          <Text style={styles.valueCell}>: -</Text>
          <Text style={styles.smallLabelCell}>FECHA EMISIÓN</Text>
          <Text style={styles.smallValueCell}>: {fechaActual} {horaActual}</Text>
        </View>
        <View style={styles.tableRowLast}>
          <Text style={styles.labelCell}>CONDICIÓN DE PAGO</Text>
          <Text style={styles.valueCell}>: Contado</Text>
          <Text style={styles.smallLabelCell}>MONEDA</Text>
          <Text style={styles.smallValueCell}>: SOLES</Text>
        </View>
      </View>

      {/* Tipo */}
      <View style={styles.tipoTable}>
        <View style={styles.tipoRow}>
          <Text style={styles.labelCell}>TIPO</Text>
          <Text style={{ width: '78%' }}>: -</Text>
        </View>
      </View>

      {/* Encabezado de tabla */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerCell, styles.headerCell10]}>Cantidad</Text>
        <Text style={[styles.headerCell, styles.headerCell60]}>Descripción</Text>
        <Text style={[styles.headerCell, styles.headerCell15]}>P. Unitario</Text>
        <Text style={[styles.headerCell, styles.headerCell15]}>Total</Text>
      </View>

      {/* Detalles */}
      <View style={styles.detailsRow}>
        <Text style={styles.detailCell10}>1</Text>
        <View style={styles.detailCell60}>
          <Text>FECHA VIAJE: {pasajero.fecha}</Text>
          <Text>HORA DE VIAJE: {pasajero.hora_salida}</Text>
          <Text>ASIENTO: {pasajero.numero_asiento}</Text>
          <Text>PISO: {pasajero.piso}</Text>
          <Text>SERVICIO: {pasajero.tipo_servicio?.toUpperCase()}</Text>
          <Text>PASAJERO: {pasajero.nombres} {pasajero.apellidos}</Text>
          <Text>ORIGEN: {pasajero.origen} - DESTINO: {pasajero.destino}</Text>
        </View>
        <Text style={styles.detailCell15}>S/. {pasajero.precio}</Text>
        <Text style={styles.detailCell15}>S/. {pasajero.precio}</Text>
      </View>

      {/* Totales */}
      <View style={styles.totalesContainer}>
        <View style={styles.totalesLeft}>
          <Text><Text style={{ fontWeight: 'bold' }}>SON : </Text>{convertirNumeroALetras(totalImporte)} 00/100 SOLES.</Text>
        </View>
        <View style={styles.totalesRight}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Importe Total :</Text>
            <Text style={styles.totalValue}>S/. {totalImporte.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Footer con QR */}
      <View style={styles.footerContainer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerTitle}>¡Gracias por viajar con Movitex!</Text>
          <Text style={styles.footerText}>Por favor, presente esta boleta al momento del embarque.</Text>
          <Text style={styles.smallText}>Código de Reserva: {idReserva}</Text>
          <Text style={styles.smallText}>ID Boleto: {pasajero.id_boleto}</Text>
        </View>
        <View style={styles.footerRight}>
          <Image 
            style={styles.qrCode}
            src={generarQRCode(pasajero.id_boleto)}
          />
          <Text style={styles.smallText}>Escanea para verificar</Text>
        </View>
      </View>
    </Page>
  );
};

// Documento completo con todas las boletas
const BoletaPDF = ({ pasajeros, idReserva }) => (
  <Document>
    {pasajeros?.map((pasajero, index) => (
      <BoletaPaginaPDF 
        key={index} 
        pasajero={pasajero} 
        idReserva={idReserva} 
      />
    ))}
  </Document>
);

export default BoletaPDF;
