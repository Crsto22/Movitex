// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@4.0.0'

console.log("Función de Boletas iniciada!")

// Configurar Resend con API Key directa
const resend = new Resend('re_WhszvfnP_DiAkLm7Znxsi93TvNpXSAdv4')

// Configuración de Supabase
const supabaseUrl = 'https://dqvosxabkqtblfhxgjbm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdm9zeGFia3F0YmxmaHhnamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjQ0MzcsImV4cCI6MjA3MTMwMDQzN30.wz_UB_XqMQZc2y4YF4ox5N79dcuOhNikYSnA2ZVPB-g'

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Función para generar URL del código QR
function generarQRCode(id_boleto: string): string {
  // Usar API gratuita de QR Code (qr-server.com)
  const qrData = encodeURIComponent(`${id_boleto}`)
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}&bgcolor=ffffff&color=000000`
}

// Función para generar HTML de la boleta individual para un pasajero
function generarHTMLBoleta(pasajero: any, id_reserva: string) {
  if (!pasajero) {
    return '<p>No se encontraron datos de la boleta.</p>'
  }

  const fechaActual = new Date().toLocaleDateString('es-PE')
  const horaActual = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  const totalImporte = parseFloat(pasajero.precio || 0)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Boleta de Venta Electrónica - ${id_reserva}</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 10px; color: #000;">
        
        <!-- Header -->
        <table cellspacing="0" style="width:100%;text-align:left;font-size:10px">
        <tbody><tr>
        <td style="width:60%">
        <table style="width:100%">
        <tbody><tr><td style="font-size:24px;font-weight:bold">MOVITEX</td></tr>
        </tbody></table>
        </td>
        <td style="width:40%;text-align:center">
        <img style="width:50%" src="https://www.movitexgroup.tech/assets/Logo-DQSFG36w.png" alt="Logo"><br>
        </td>
        </tr>
        <tr>
        <td style="width:60%">
        <table style="width:100%">
        <tr><td>Télf.: 999999999</td><td></td></tr>
        <tr><td>Agencia de Venta: Movitex</td><td></td></tr>
        </tbody></table>
        </td>
        <td style="width:40%">
        <br>
        <table style="width:100%;border:solid 1px black;text-align:center;font-weight:bold">
        <tbody><tr><td style="width:100%;font-size:9px"><br></td></tr>
        <tr><td>BOLETA DE VENTA ELECTRONICA</td></tr>
        <tr><td style="font-size:9px">${id_reserva.slice(-8).toUpperCase()}<br><br></td></tr>
        </tbody></table>
        </td>
        </tr>
        </tbody></table>
        <br>
        
        <!-- Información del Cliente -->
        <table cellspacing="0" style="width:100%;border:solid 1px black;text-align:left;font-size:11px;padding:5px">
        <tbody><tr>
        <td style="width:20%"><strong>SEÑOR(ES)</strong></td>
        <td style="width:50%">: ${pasajero?.nombres} ${pasajero?.apellidos}</td>
        <td style="width:15%">&nbsp;</td>
        <td style="width:15%">&nbsp;</td>
        </tr>
        <tr>
        <td style="width:20%"><strong>DOCUMENTO: </strong></td>
        <td style="width:50%">: ${pasajero?.dni}</td>
        <td style="width:15%">&nbsp;</td>
        <td style="width:15%">&nbsp;</td>
        </tr>
        <tr>
        <td style="width:20%"><strong>DIRECCIÓN</strong></td>
        <td style="width:50%">: - </td>
        <td style="width:15%"><strong>FECHA EMISIÓN</strong></td>
        <td style="width:15%">: ${fechaActual} ${horaActual}</td>
        </tr>
        <tr>
        <td style="width:20%"><strong>CONDICIÓN DE PAGO</strong></td>
        <td style="width:50%">: Contado</td>
        <td style="width:15%"><strong>MONEDA</strong></td>
        <td style="width:15%">: SOLES </td>
        </tr>
        </tbody></table>
        
        <table cellspacing="0" style="width:100%;border:solid 1px white;text-align:left;font-size:11px;padding:5px">
        <tbody><tr>
        <td style="width:20%"><strong>TIPO</strong></td>
        <td style="width:80%">: -</td>
        </tr>
        </tbody></table>
        
        <!-- Encabezado de tabla -->
        <table cellspacing="0" style="width:100%;text-align:center;font-size:11px">
        <tbody><tr>
        <th style="width:20%;border-right:1px solid black;border-left:1px solid black;border-bottom:1px solid black;border-top:1px solid black;padding:7px 5px">Cantidad</th>
        <th style="width:50%;border-right:1px solid black;border-top:1px solid black;border-bottom:1px solid black;padding:7px 5px">Descripción</th>
        <th style="width:15%;border-right:1px solid black;border-top:1px solid black;border-bottom:1px solid black;padding:7px 5px">P. Unitario</th>
        <th style="width:15%;border-right:1px solid black;border-top:1px solid black;border-bottom:1px solid black;padding:7px 5px">Total</th>
        </tr>
        </tbody></table>
        
        <!-- Detalles de la boleta -->
        <table cellspacing="0" style="width:100%;text-align:center;font-size:11px">
        <tbody><tr>
        <td style="width:20%;text-align:center;padding:5px;border-right:1px solid black;border-left:1px solid black"> 1 </td>
        <td style="width:50%;text-align:left;padding:5px;border-right:1px solid black">FECHA VIAJE: ${pasajero.fecha}
HORA DE VIAJE: ${pasajero.hora_salida}
ASIENTO: ${pasajero.numero_asiento}
PISO: ${pasajero.piso}
SERVICIO: ${pasajero.tipo_servicio?.toUpperCase()}
PASAJERO: ${pasajero.nombres} ${pasajero.apellidos}
ORIGEN: ${pasajero.origen} - DESTINO: ${pasajero.destino}
        </td>
        <td style="width:15%;text-align:right;padding:5px;border-right:1px solid black">S/. ${pasajero.precio}</td>
        <td style="width:15%;text-align:right;padding:5px;border-right:1px solid black">S/. ${pasajero.precio}</td>
        </tr>
        </tbody></table>
        
        <!-- Totales -->
        <table cellspacing="0" style="width:100%;text-align:center;font-size:11px;border-top:1px solid black">
        <tbody><tr>
        <td rowspan="7" style="width:70%;text-align:left;border-right:1px solid black;vertical-align:middle;padding:5px"><strong>SON : </strong>${convertirNumeroALetras(totalImporte)} 00/100 SOLES.</td>
        <tr>
        <td style="width:15%;text-align:left;border-right:1px solid black;border-bottom:1px solid black;padding:3px">Importe Total : </td>
        <td style="width:15%;text-align:right;border-right:1px solid black;border-bottom:1px solid black;padding:3px">S/. ${totalImporte.toFixed(2)}</td>
        </tr>
        </tbody></table>
        
        <!-- Footer con QR -->
        <table cellspacing="0" style="width:100%;text-align:center;font-size:10px;padding:10px;vertical-align:middle">
        <tbody>
        <tr>
        <td style="width:70%;text-align:left;vertical-align:middle">
        <strong>¡Gracias por viajar con Movitex!</strong><br>
        Por favor, presente esta boleta al momento del embarque.<br>
        <small>Código de Reserva: ${id_reserva}</small><br>
        <small>ID Boleto: ${pasajero.id_boleto}</small>
        </td>
        <td style="width:30%;text-align:center;vertical-align:middle">
        <img src="${generarQRCode(pasajero.id_boleto)}" alt="QR Code" style="width:100px;height:100px;border:1px solid #ccc;"><br>
        <small><strong>Escanea para verificar</strong></small>
        </td>
        </tr>
        </tbody></table>
        
    </body>
    </html>
  `
}

// Función auxiliar para convertir números a letras (simplificada)
function convertirNumeroALetras(numero: number): string {
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
}

// Función para enviar correo con Resend
async function enviarCorreoBoleta(correo: string, boleta: any[], id_reserva: string) {
  try {
    // Generar HTML individual para cada pasajero
    const boletasHTML = boleta.map(pasajero => generarHTMLBoleta(pasajero, id_reserva))
    
    // Combinar todos los boletos en un solo HTML separados por saltos de página
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Boletos de Viaje - Movitex</title>
        <style>
          @media print {
            .page-break { page-break-after: always; }
          }
          .boleto-container { margin-bottom: 50px; }
        </style>
      </head>
      <body>
        ${boletasHTML.map((html, index) => `
          <div class="boleto-container ${index < boletasHTML.length - 1 ? 'page-break' : ''}">
            ${html.replace(/<!DOCTYPE html>|<html>|<head>.*?<\/head>|<body[^>]*>|<\/body>|<\/html>/gs, '')}
          </div>
        `).join('\n')}
      </body>
      </html>
    `
    
    const numPasajeros = boleta.length
    const subject = numPasajeros > 1 
      ? `BOLETOS DE VIAJE MOVITEX - ${numPasajeros} Pasajeros`
      : `BOLETO DE VIAJE MOVITEX`
    
    const { data, error } = await resend.emails.send({
      from: 'Boletas Movitex <noreply@movitexgroup.tech>',
      to: [correo],
      subject: subject,
      html: htmlContent
    })

    if (error) {
      console.error('Error enviando correo:', error)
      return { success: false, error }
    }

    console.log(`Correo enviado exitosamente con ${numPasajeros} boleto(s):`, data)
    return { success: true, data }
  } catch (error) {
    console.error('Error en enviarCorreoBoleta:', error)
    return { success: false, error }
  }
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Obtener el payload del webhook de Supabase
    const payload = await req.json()
    console.log('Webhook recibido:', JSON.stringify(payload, null, 2))

    // El webhook de Supabase envía los datos en diferentes formatos según el evento
    // Para INSERT: payload.record contiene el nuevo registro
    // Para UPDATE: payload.record contiene el registro actualizado
    let id_reserva = null

    if (payload.type === 'INSERT' && payload.record) {
      // Nueva reserva insertada
      id_reserva = payload.record.id_reserva
      console.log(`Nueva reserva detectada: ${id_reserva}`)
    } else if (payload.type === 'UPDATE' && payload.record) {
      // Reserva actualizada (por si quieres procesar updates también)
      id_reserva = payload.record.id_reserva
      console.log(`Reserva actualizada: ${id_reserva}`)
    } else if (payload.id_reserva) {
      // Fallback: si viene directamente el id_reserva
      id_reserva = payload.id_reserva
    } else {
      console.log('Webhook recibido pero no es una nueva reserva o no tiene el formato esperado')
      return new Response(
        JSON.stringify({ message: 'Webhook procesado - no es una nueva reserva' }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }
    
    if (!id_reserva) {
      return new Response(
        JSON.stringify({ error: 'Falta el parámetro id_reserva' }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    console.log(`Procesando reserva: ${id_reserva}`)

    // 1. Buscar la reserva para obtener el correo_anonimo
    const { data: reserva, error: errorReserva } = await supabase
      .from('reservas')
      .select('correo_anonimo')
      .eq('id_reserva', id_reserva)
      .maybeSingle()

    if (errorReserva) {
      console.error('Error al buscar reserva:', errorReserva)
      return new Response(
        JSON.stringify({ error: 'Error al buscar la reserva' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    if (!reserva) {
      return new Response(
        JSON.stringify({ error: 'Reserva no encontrada' }),
        { 
          status: 404,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    // 2. Obtener el correo
    let correo = reserva.correo_anonimo

    if (!correo) {
      // Si no hay correo_anonimo, usar la función obtener_correo_reserva
      console.log('No hay correo anónimo, usando función obtener_correo_reserva')
      const { data: correoObtenido, error: errorCorreo } = await supabase
        .rpc('obtener_correo_reserva', { p_id_reserva: id_reserva })

      if (errorCorreo) {
        console.error('Error al obtener correo:', errorCorreo)
        return new Response(
          JSON.stringify({ error: 'Error al obtener el correo de la reserva' }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            } 
          }
        )
      }

      correo = correoObtenido
    }

    console.log(`Correo obtenido: ${correo}`)

    // 3. Generar la boleta usando la función generar_boleta_viaje
    const { data: boleta, error: errorBoleta } = await supabase
      .rpc('generar_boleta_viaje', { p_id_reserva: id_reserva })

    if (errorBoleta) {
      console.error('Error al generar boleta:', errorBoleta)
      return new Response(
        JSON.stringify({ error: 'Error al generar la boleta del viaje' }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

    console.log('Boleta generada exitosamente')

    // 4. Enviar correo con la boleta
    const resultadoCorreo = await enviarCorreoBoleta(correo, boleta || [], id_reserva)

    if (resultadoCorreo.success) {
      console.log(`✅ Correo enviado exitosamente a: ${correo}`)
      return new Response(
        JSON.stringify({ 
          success: true,
          id_reserva,
          correo,
          boleta: boleta || [],
          email_sent: true,
          message: 'Boleta procesada y correo enviado exitosamente.'
        }),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    } else {
      console.log(`❌ Error enviando correo a: ${correo}`)
      return new Response(
        JSON.stringify({ 
          success: false,
          id_reserva,
          correo,
          boleta: boleta || [],
          email_sent: false,
          email_error: resultadoCorreo.error,
          message: 'Boleta procesada pero falló el envío de correo.'
        }),
        { 
          status: 500,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          } 
        }
      )
    }

  } catch (error) {
    console.error('Error general:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        } 
      }
    )
  }
})

/* CONFIGURACIÓN AUTOMÁTICA CON WEBHOOKS Y RESEND:

  Esta función se ejecuta automáticamente cuando se detecta una nueva reserva
  y envía la boleta por correo usando Resend.
  
  PASOS PARA CONFIGURAR:

  1. Configurar Resend API Key:
     - Ve a https://resend.com y crea una cuenta
     - Obtén tu API Key
     - En Supabase Dashboard > Settings > Edge Functions
     - Agregar variable de entorno: RESEND_API_KEY = re_xxxxxxxxx

  2. Configurar dominio en Resend (opcional pero recomendado):
     - En Resend Dashboard, agrega tu dominio
     - Configura los registros DNS
     - Cambia 'noreply@tuempresa.com' por tu dominio verificado

  3. Desplegar la función:
     supabase functions deploy boleta

  4. Configurar Database Webhook:
     - En Supabase Dashboard > Database > Webhooks
     - Name: "Auto Boleta Webhook"  
     - Table: "reservas"
     - Events: "Insert"
     - HTTP URL: https://[tu-proyecto].supabase.co/functions/v1/boleta
     - HTTP Method: POST
     - Headers: Authorization: Bearer [service-role-key]

  FUNCIONAMIENTO AUTOMÁTICO:
  Nueva reserva → Webhook → Procesa boleta → Envía correo con HTML → ✅ Completado

  CARACTERÍSTICAS:
  ✅ Detección automática de nuevas reservas
  ✅ Obtiene correo (anónimo o de usuario registrado)  
  ✅ Genera boleta con datos completos
  ✅ Envía correo HTML con diseño profesional
  ✅ Manejo de errores y logs detallados

*/
