import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #f0251f',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f0251f',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 3,
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
    backgroundColor: '#f5f5f5',
    padding: 8,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0251f',
    padding: 8,
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e0e0e0',
    padding: 8,
    fontSize: 9,
  },
  tableRowAlt: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderBottom: '1 solid #e0e0e0',
    padding: 8,
    fontSize: 9,
  },
  col1: { width: '8%', textAlign: 'center' },
  col2: { width: '40%' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '20%', textAlign: 'right' },
  col5: { width: '17%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#999999',
    borderTop: '1 solid #e0e0e0',
    paddingTop: 10,
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#f0251f',
    padding: 10,
    marginTop: 5,
  },
})

const ReporteRutasPDF = ({ ingresosPorRuta, fechaInicio, fechaFin }) => {
  const totalIngresos = ingresosPorRuta?.reduce((sum, r) => sum + r.total, 0) || 0
  const fechaGeneracion = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>REPORTE DE INGRESOS POR RUTA - MOVITEX</Text>
          <Text style={styles.subtitle}>Período: {fechaInicio} al {fechaFin}</Text>
          <Text style={styles.subtitle}>Generado: {fechaGeneracion}</Text>
        </View>

        {/* Tabla de Ingresos por Ruta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Ingresos por Ruta (Ordenado por Mayor Ingreso)</Text>
          
          {ingresosPorRuta && ingresosPorRuta.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>#</Text>
                <Text style={styles.col2}>Ruta</Text>
                <Text style={styles.col3}>Cant. Viajes</Text>
                <Text style={styles.col4}>Ingresos Totales</Text>
                <Text style={styles.col5}>Promedio/Viaje</Text>
              </View>
              {ingresosPorRuta.map((ruta, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={styles.col1}>{index + 1}</Text>
                  <Text style={styles.col2}>{ruta.origen} → {ruta.destino}</Text>
                  <Text style={styles.col3}>{ruta.cantidad}</Text>
                  <Text style={styles.col4}>S/ {ruta.total.toFixed(2)}</Text>
                  <Text style={styles.col5}>S/ {(ruta.total / ruta.cantidad).toFixed(2)}</Text>
                </View>
              ))}
              
              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={{width: '63%', fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right', paddingRight: 10}}>
                  TOTAL INGRESOS:
                </Text>
                <Text style={{width: '20%', fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right'}}>
                  S/ {totalIngresos.toFixed(2)}
                </Text>
                <Text style={{width: '17%'}}></Text>
              </View>
            </View>
          ) : (
            <Text style={{ fontSize: 10, color: '#999999', textAlign: 'center', marginTop: 20 }}>
              No hay datos registrados en este período
            </Text>
          )}
        </View>

        {/* Resumen */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 Resumen del Período</Text>
          <View style={{marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 5}}>
            <Text style={{fontSize: 10, color: '#333333', marginBottom: 5}}>
              • Total de rutas activas: {ingresosPorRuta?.length || 0}
            </Text>
            <Text style={{fontSize: 10, color: '#333333', marginBottom: 5}}>
              • Total de viajes vendidos: {ingresosPorRuta?.reduce((sum, r) => sum + r.cantidad, 0) || 0}
            </Text>
            <Text style={{fontSize: 10, color: '#333333', marginBottom: 5}}>
              • Ingreso promedio por ruta: S/ {ingresosPorRuta?.length > 0 ? (totalIngresos / ingresosPorRuta.length).toFixed(2) : '0.00'}
            </Text>
            {ingresosPorRuta && ingresosPorRuta.length > 0 && (
              <>
                <Text style={{fontSize: 10, color: '#333333', marginBottom: 5, marginTop: 10, fontWeight: 'bold'}}>
                  🏆 Ruta con mayor ingreso:
                </Text>
                <Text style={{fontSize: 10, color: '#f0251f', marginLeft: 10}}>
                  {ingresosPorRuta[0].origen} → {ingresosPorRuta[0].destino} (S/ {ingresosPorRuta[0].total.toFixed(2)})
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Movitex - Sistema de Gestión de Buses</Text>
          <Text>www.movitexgroup.tech</Text>
        </View>
      </Page>
    </Document>
  )
}

export default ReporteRutasPDF
