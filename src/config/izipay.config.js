// Configuración de Izipay para Movitex
// Centraliza todas las credenciales y configuraciones del gateway de pagos

export const IZIPAY_CONFIG = {
    // Credenciales del comercio (Sandbox)
    MERCHANT_CODE: '4004345',
    PUBLIC_KEY: 'VErethUtraQuxas57wuMuquprADrAHAb',
    
    // Ambiente
    ENVIRONMENT: 'sandbox', // 'sandbox' o 'production'
    
    // URL completa de la Edge Function de Izipay
    IZIPAY_URL: 'https://dqvosxabkqtblfhxgjbm.supabase.co/functions/v1/izipay',
    
    // Configuración del formulario
    FORM_CONFIG: {
        requestSource: 'ECOMMERCE',
        typeForm: 'POP_UP', // POP_UP o EMBED
        showButtonProcessForm: false,
    },
    
    // Apariencia personalizada
    APPEARANCE: {
        customTheme: {
            colors: {
                primary: {
                    background: '#f0251f', // Rojo de Movitex
                    color: '#FFFFFF'
                }
            }
        },
        logo: 'https://www.movitexgroup.tech/assets/Movitex-BZtwtedD.svg',
    },
    
    // Moneda
    CURRENCY: 'PEN', // Soles peruanos
};

// Obtener URL completa de la Edge Function
export const getIzipayUrl = () => {
    return IZIPAY_CONFIG.IZIPAY_URL;
};

// Validar configuración
export const validateIzipayConfig = () => {
    const required = ['MERCHANT_CODE', 'PUBLIC_KEY', 'IZIPAY_URL'];
    const missing = required.filter(key => !IZIPAY_CONFIG[key]);
    
    if (missing.length > 0) {
        console.error('⚠️ Configuración de Izipay incompleta. Faltan:', missing);
        return false;
    }
    
    return true;
};
