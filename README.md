<div align="center">
  <img src="./src/assets/Logo.png" alt="Movitex Logo" width="300"/>
  
  # Movitex - Sistema de Reservas de Pasajes de Bus
  
  ### Plataforma moderna de venta de pasajes interprovinciales con autenticación segura y gestión completa de reservas
  
  [![React](https://img.shields.io/badge/React-19.1.1-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.56.1-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.12-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  
</div>

---

## Descripción

**Movitex** es una aplicación web moderna para la venta de pasajes de bus interprovinciales. Ofrece una experiencia de usuario fluida y segura, con múltiples niveles de servicio, autenticación robusta y gestión completa de reservas.

### Características Principales

- **Sistema de Reservas Completo**: Selección de asientos, múltiples tipos de servicio (One, Pro, Ultra)
- **Autenticación Segura**: Login tradicional y OAuth con Google
- **Protección Anti-Bot**: Integración con Cloudflare Turnstile
- **Diseño Responsive**: Experiencia optimizada para desktop y móvil
- **Gestión de Pasajeros**: Registro de datos completos y validación de DNI
- **Historial de Reservas**: Visualización de reservas completadas
- **Rutas Dinámicas**: Búsqueda de viajes entre ciudades
- **UI Moderna**: Animaciones fluidas y componentes interactivos

---

## Tecnologías

### Frontend
- **React 19.1.1** - Biblioteca de UI con hooks modernos
- **Vite 7.1.2** - Build tool ultrarrápido
- **React Router DOM 7.8.1** - Navegación SPA
- **TailwindCSS 4.1.12** - Framework CSS utility-first
- **Lucide React** - Iconos modernos
- **Framer Motion** - Animaciones fluidas

### Backend & Servicios
- **Supabase** - Backend as a Service (PostgreSQL + Auth)
- **Cloudflare Turnstile** - Protección CAPTCHA
- **API DNI** - Validación y autocompletado de datos

### Librerías Adicionales
- **React Hot Toast** - Notificaciones elegantes
- **React Transition Group** - Transiciones de componentes
- **Lottie React** - Animaciones vectoriales
- **React Canvas Confetti** - Efectos de celebración

---

## Estructura del Proyecto

```
Movitex/
├── src/
│   ├── assets/              # Imágenes, logos, iconos
│   ├── components/          # Componentes React
│   │   ├── Navbar.jsx       # Barra de navegación
│   │   ├── LoginModal.jsx   # Modal de inicio de sesión
│   │   ├── RegisterModal.jsx # Modal de registro
│   │   ├── ModalRegistroGoogle.jsx # Completar datos OAuth
│   │   ├── Inicio/          # Componentes de la página principal
│   │   ├── MiCuenta/        # Componentes de perfil de usuario
│   │   └── Pasajes-bus/     # Componentes de reserva de pasajes
│   ├── context/             # Contextos de React
│   │   ├── AuthContext.jsx  # Gestión de autenticación
│   │   ├── AsientosContext.jsx # Gestión de asientos
│   │   ├── CiudadesContext.jsx # Gestión de ciudades
│   │   ├── PasajerosContext.jsx # Gestión de pasajeros
│   │   └── ViajesContext.jsx # Gestión de viajes
│   ├── services/            # Servicios externos
│   │   └── dniService.js    # Validación de DNI
│   ├── supabase/            # Configuración de Supabase
│   ├── App.jsx              # Componente principal
│   └── main.jsx             # Punto de entrada
├── public/                  # Archivos estáticos
├── package.json             # Dependencias
└── vite.config.js           # Configuración de Vite
```

---

## Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta de Supabase
- Cuenta de Cloudflare Turnstile

### 1. Clonar el repositorio
```bash
git clone https://github.com/Crsto22/Movitex.git
cd Movitex
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_TURNSTILE_SITE_KEY=tu_turnstile_site_key
```

### 4. Ejecutar en desarrollo
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### 5. Build para producción
```bash
npm run build
```

---

## Características de Autenticación

### Registro de Usuarios
- Validación de campos (DNI, teléfono, email, contraseña)
- Autocompletado de datos con API de DNI
- Confirmación de email obligatoria
- Protección CAPTCHA con Cloudflare Turnstile
- Manejo de errores amigable

### Inicio de Sesión
- Login tradicional con email y contraseña
- OAuth con Google
- Verificación de email confirmado
- Recuperación de contraseña
- Persistencia de sesión con localStorage

### Gestión de Sesión
- Tokens JWT automáticos (Supabase)
- Refresh tokens
- Cierre de sesión seguro
- Actualización de perfil
- Cambio de contraseña

---

## Sistema de Reservas

### Niveles de Servicio
1. **Movitex One** - Servicio estándar
2. **Movitex Pro** - Servicio premium
3. **Movitex Ultra** - Servicio de lujo

### Flujo de Reserva
1. Búsqueda de viajes (origen, destino, fecha)
2. Selección de servicio
3. Selección de asientos
4. Registro de pasajeros
5. Confirmación y pago
6. Visualización de reserva completada

---

## Base de Datos (Supabase/PostgreSQL)

### Tablas Principales
- **usuarios** - Datos de usuarios registrados
- **viajes** - Información de viajes disponibles
- **reservas** - Reservas realizadas
- **pasajeros** - Datos de pasajeros
- **asientos** - Estado de asientos por viaje
- **ciudades** - Catálogo de ciudades

### Funciones SQL
- `obtener_reservas_completadas_usuario(p_id_usuario)` - Obtiene historial de reservas

---

## Componentes Principales

### Modales
- **LoginModal** - Inicio de sesión y recuperación de contraseña
- **RegisterModal** - Registro de nuevos usuarios
- **ModalRegistroGoogle** - Completar datos de usuarios OAuth

### Contextos
- **AuthContext** - Gestión global de autenticación
- **AsientosContext** - Estado de asientos seleccionados
- **CiudadesContext** - Catálogo de ciudades
- **PasajerosContext** - Datos de pasajeros
- **ViajesContext** - Búsqueda y selección de viajes

---

## Seguridad

- Protección CAPTCHA en formularios críticos
- Validación de email obligatoria
- Contraseñas hasheadas (Supabase Auth)
- Tokens JWT con expiración
- Validación de datos en frontend y backend
- Protección contra SQL injection (prepared statements)
- CORS configurado correctamente

---

## Responsive Design

La aplicación está completamente optimizada para:
- Móviles (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Pantallas grandes (1920px+)

---

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto es privado y pertenece a Movitex.

---

## Equipo

Desarrollado con ❤️ por el equipo de Movitex

---

## Contacto

Para consultas o soporte, contacta a través de la sección de contactos en la aplicación.

---

<div align="center">
  <p>Hecho con React + Vite + Supabase</p>
  <p> 2025 Movitex - Todos los derechos reservados</p>
</div>
