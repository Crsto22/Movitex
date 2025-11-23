// Servicio de Izipay para Movitex
// Maneja toda la lógica de integración con el gateway de pagos

import { IZIPAY_CONFIG, getIzipayUrl } from '../config/izipay.config';
import { supabase } from '../supabase/supabase';

/**
 * Genera un ID de transacción único basado en timestamp
 * @returns {object} { transactionId, orderNumber }
 */
export const generateTransactionId = () => {
    const currentTimeUnix = Math.floor(Date.now()) * 1000;
    const transactionId = currentTimeUnix.toString().slice(0, 14);
    const orderNumber = currentTimeUnix.toString().slice(0, 10).toString();
    
    return {
        transactionId,
        orderNumber,
    };
};

/**
 * Obtiene el token de sesión desde Supabase Edge Function
 * @param {string} transactionId - ID único de la transacción
 * @param {number} amount - Monto a pagar
 * @param {string} orderNumber - Número de orden
 * @returns {Promise<object>} Token de autorización o error
 */
export const getTokenSession = async (transactionId, amount, orderNumber) => {
    try {
        const response = await fetch(getIzipayUrl(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'transactionId': transactionId,
            },
            body: JSON.stringify({
                requestSource: IZIPAY_CONFIG.FORM_CONFIG.requestSource,
                merchantCode: IZIPAY_CONFIG.MERCHANT_CODE,
                orderNumber: orderNumber,
                publicKey: IZIPAY_CONFIG.PUBLIC_KEY,
                amount: amount.toString(),
            }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error al obtener token de sesión');
        }
        
        return data;
    } catch (error) {
        console.error('❌ Error al conectar con Supabase Edge Function:', error);
        return {
            response: {
                token: undefined,
                error: error.message || 'ERROR_CONEXION_IZIPAY'
            }
        };
    }
};

/**
 * Guarda la transacción exitosa en la base de datos
 * @param {object} paymentResponse - Respuesta de Izipay
 * @param {string} idReserva - ID de la reserva asociada
 * @returns {Promise<object>} Resultado de la inserción
 */
export const guardarTransaccion = async (paymentResponse, idReserva) => {
    try {
        const { data, error } = await supabase
            .from('transacciones_izipay')
            .insert({
                id_reserva: idReserva,
                transaction_id: paymentResponse.transactionId,
                order_number: paymentResponse.orderNumber,
                amount: parseFloat(paymentResponse.amount),
                currency: paymentResponse.currency || IZIPAY_CONFIG.CURRENCY,
                code_auth: paymentResponse.codeAuth,
                reference_number: paymentResponse.referenceNumber,
                card_brand: paymentResponse.card?.brand,
                card_pan: paymentResponse.card?.pan,
                customer_email: paymentResponse.billing?.email,
                customer_name: `${paymentResponse.billing?.firstName || ''} ${paymentResponse.billing?.lastName || ''}`.trim(),
                customer_document: paymentResponse.billing?.document,
                date_transaction: paymentResponse.dateTransaction,
                time_transaction: paymentResponse.timeTransaction,
                status: 'approved',
                response_code: paymentResponse.code,
                response_message: paymentResponse.message,
            });

        if (error) {
            console.error('❌ Error al guardar transacción en BD:', error);
            throw error;
        }

        console.log('✅ Transacción guardada exitosamente en BD');
        return { success: true, data };
        
    } catch (error) {
        console.error('❌ Excepción al guardar transacción:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Crea la configuración completa de Izipay para el checkout
 * @param {object} params - Parámetros de configuración
 * @returns {object} Configuración de Izipay
 */
export const createIzipayConfig = ({
    transactionId,
    orderNumber,
    amount,
    billingData,
    productName = 'Pasajes de Bus Movitex'
}) => {
    return {
        config: {
            transactionId: transactionId,
            action: window.Izipay.enums.payActions.PAY,
            merchantCode: IZIPAY_CONFIG.MERCHANT_CODE,
            order: {
                orderNumber: orderNumber,
                currency: IZIPAY_CONFIG.CURRENCY,
                amount: amount.toString(),
                processType: window.Izipay.enums.processType.AUTHORIZATION,
                merchantBuyerId: `buyer-${billingData.document || 'guest'}`,
                dateTimeTransaction: Date.now().toString(),
                payMethod: window.Izipay.enums.showMethods.ALL,
            },
            billing: {
                firstName: billingData.firstName || 'Cliente',
                lastName: billingData.lastName || 'Movitex',
                email: billingData.email || 'cliente@movitex.com',
                phoneNumber: billingData.phoneNumber || '999999999',
                street: billingData.street || 'Av. Principal',
                city: billingData.city || 'Lima',
                state: billingData.state || 'Lima',
                country: 'PE',
                postalCode: billingData.postalCode || '15001',
                document: billingData.document || '00000000',
                documentType: window.Izipay.enums.documentType.DNI,
            },
            render: {
                typeForm: window.Izipay.enums.typeForm.POP_UP,
                container: '#izipay-container',
                showButtonProcessForm: false,
            },
            urlRedirect: window.location.href,
            appearance: IZIPAY_CONFIG.APPEARANCE,
        }
    };
};

/**
 * Inicializa y carga el formulario de Izipay
 * @param {string} token - Token de autorización
 * @param {object} config - Configuración de Izipay
 * @param {function} callback - Función callback para la respuesta del pago
 * @returns {object} Instancia del checkout de Izipay
 */
export const loadIzipayForm = (token, config, callback) => {
    try {
        // Verificar que Izipay esté cargado
        if (typeof window.Izipay === 'undefined') {
            throw new Error('Izipay SDK no está cargado. Verifica el script en index.html');
        }

        const checkout = new window.Izipay({ config: config.config });

        checkout.LoadForm({
            authorization: token,
            keyRSA: 'RSA',
            callbackResponse: callback,
        });

        return checkout;
        
    } catch (error) {
        console.error('❌ Error al cargar formulario de Izipay:', error);
        throw error;
    }
};

/**
 * Valida si una respuesta de Izipay es exitosa
 * @param {object} response - Respuesta del callback de Izipay
 * @returns {boolean} true si el pago fue exitoso
 */
export const isPaymentSuccessful = (response) => {
    return response && response.code === '00';
};

/**
 * Obtiene mensaje de error legible para el usuario
 * @param {object} response - Respuesta del callback de Izipay
 * @returns {string} Mensaje de error
 */
export const getPaymentErrorMessage = (response) => {
    const errorMessages = {
        '02': 'Llamar al banco emisor',
        '05': 'Pago rechazado por el banco',
        '14': 'Número de tarjeta inválido',
        '30': 'Error en el formato de datos',
        '51': 'Fondos insuficientes',
        '54': 'Tarjeta vencida',
        '91': 'Timeout de la transacción',
        '96': 'Error del sistema',
    };
    
    const code = response?.code;
    const defaultMessage = response?.message || response?.messageUser || 'Error desconocido';
    
    return errorMessages[code] || defaultMessage;
};
