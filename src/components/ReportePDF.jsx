import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'

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
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricBox: {
    width: '23%',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 5,
    border: '1 solid #e0e0e0',
  },
  metricLabel: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 5,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f0251f',
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
  col1: { width: '30%' },
  col2: { width: '30%' },
  col3: { width: '20%' },
  col4: { width: '20%', textAlign: 'right' },
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
  totalLabel: {
    width: '80%',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: '20%',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
  },
})

const ReportePDF = ({ metricas, ventas, fechaInicio, fechaFin }) => {
  const totalVentas = ventas?.reduce((sum, v) => sum + v.total_pagado, 0) || 0
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
          <Text style={styles.title}>REPORTE DE VENTAS - MOVITEX</Text>
          <Text style={styles.subtitle}>Período: {fechaInicio} al {fechaFin}</Text>
          <Text style={styles.subtitle}>Generado: {fechaGeneracion}</Text>
        </View>

        {/* Métricas Generales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Métricas Generales</Text>
          <View style={styles.metricsContainer}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Reservas</Text>
              <Text style={styles.metricValue}>{metricas?.totalReservas || 0}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Ingresos</Text>
              <Text style={styles.metricValue}>S/ {(metricas?.totalIngresos || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Pasajeros</Text>
              <Text style={styles.metricValue}>{metricas?.totalPasajeros || 0}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Reservas Hoy</Text>
              <Text style={styles.metricValue}>{metricas?.reservasHoy || 0}</Text>
            </View>
          </View>
        </View>

        {/* Tabla de Ventas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalle de Ventas del Período</Text>
          
          {ventas && ventas.length > 0 ? (
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={styles.col1}>Pasajero(s)</Text>
                <Text style={styles.col2}>Ruta</Text>
                <Text style={styles.col3}>Servicio</Text>
                <Text style={styles.col4}>Monto</Text>
              </View>
              {ventas.map((venta, index) => (
                <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                  <Text style={styles.col1}>
                    {venta.pasajeros && venta.pasajeros.length > 0 
                      ? venta.pasajeros.map(p => `${p.nombre} ${p.apellido}`).join(', ')
                      : 'Sin pasajeros'}
                  </Text>
                  <Text style={styles.col2}>{venta.origen} → {venta.destino}</Text>
                  <Text style={styles.col3}>{venta.servicio}</Text>
                  <Text style={styles.col4}>S/ {venta.total_pagado.toFixed(2)}</Text>
                </View>
              ))}
              
              {/* Total */}
              <View style={styles.totalRow}>
                <Text style={{width: '80%', fontSize: 11, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right', paddingRight: 10}}>
                  TOTAL PERÍODO:
                </Text>
                <Text style={{width: '20%', fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'right'}}>
                  S/ {totalVentas.toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={{ fontSize: 10, color: '#999999', textAlign: 'center', marginTop: 20 }}>
              No hay ventas registradas en este período
            </Text>
          )}
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

export default ReportePDF
