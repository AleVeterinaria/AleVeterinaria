# 🐾 Ale Veterinaria - Firebase Functions

Sistema completo de notificaciones y citas para clínica veterinaria a domicilio con Firebase Hosting + Cloud Functions v2 Node 18, integración con Zoho Mail SMTP y protección Cloudflare Turnstile.

## ⚡ Funcionalidades

### 📬 Formulario de Contacto
- Validación con Zod y sanitización
- Verificación Cloudflare Turnstile
- Envío automático por email vía Zoho SMTP
- Rate limiting por IP

### 📅 Sistema de Citas
- Creación de citas con datos de tutor y mascota
- Búsqueda automática de pacientes existentes por RUT
- Creación de nuevos pacientes si es necesario
- Email de confirmación con archivo .ics adjunto
- Notificación interna para la clínica

### 🔔 Recordatorios Automáticos
- **Citas:** 48h, 24h y mismo día
- **Vacunas:** 7 días antes de próxima dosis
- **Desparasitación:** 7 días antes de próxima dosis  
- **Seguimiento:** 7 días post-consulta sin control agendado
- **Exámenes:** 5 días después de orden sin resultado

### 📧 Plantillas de Email
- HTML responsive con CSS inline
- Versiones texto plano
- Archivos .ics para citas (zona horaria America/Santiago)
- Firmas personalizadas con WhatsApp e Instagram

### 🛡️ Seguridad
- CORS configurado para dominios específicos
- Validación Cloudflare Turnstile en backend
- Rate limiting simple en memoria
- Sanitización de inputs con Zod
- Headers CSP configurados

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
```bash
# Instalar Firebase CLI globalmente
npm install -g firebase-tools

# Autenticar con Firebase
firebase login
```

### 2. Configurar Proyecto
```bash
# Inicializar Firebase (hosting + functions v2)
firebase init

# Seleccionar:
# - Hosting
# - Functions (v2, Node 18)
# - Crear nuevo proyecto o usar existente

# Instalar dependencias de Functions
cd functions
npm install
```

### 3. Configurar Secrets
```bash
# Configurar secrets de Zoho Mail
firebase functions:secrets:set ZOHO_USER
# Valor: contacto@aleveterinaria.cl

firebase functions:secrets:set ZOHO_APP_PASS  
# Valor: [App Password de Zoho Mail]

firebase functions:secrets:set ZOHO_HOST
# Valor: smtp.zoho.com

firebase functions:secrets:set ZOHO_PORT
# Valor: 465

# Configurar Cloudflare Turnstile
firebase functions:secrets:set TURNSTILE_SECRET_KEY
# Valor: [Secret Key de Cloudflare Turnstile]
```

### 4. Configurar Turnstile en HTML
En `public/index.html`, reemplazar `__TURNSTILE_SITE_KEY__` con tu Site Key real:
```html
<div class="cf-turnstile" data-sitekey="TU_SITE_KEY_AQUI"></div>
```

### 5. Desplegar
```bash
# Compilar TypeScript y desplegar functions
npm run build
firebase deploy --only functions

# Desplegar hosting
firebase deploy --only hosting

# O desplegar todo
firebase deploy
```

## 📊 Estructura del Proyecto

```
├── functions/
│   ├── src/
│   │   ├── index.ts              # Cloud Functions principales
│   │   └── mail/
│   │       ├── mailer.ts         # Configuración Zoho SMTP
│   │       └── templates.ts      # Plantillas de email
│   ├── package.json              # Dependencias Functions
│   └── tsconfig.json            # Configuración TypeScript
├── public/
│   └── index.html               # Página principal con formularios
├── firebase.json                # Configuración Firebase
├── .firebaserc                 # Proyecto Firebase
└── README.md                   # Este archivo
```

## 🔧 Configuración Avanzada

### Zona Horaria
Todas las funciones usan `America/Santiago` como zona horaria predeterminada.

### CORS
Configurado para permitir solo:
- `https://aleveterinaria.cl`
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5000`

### Rate Limiting
- Contacto: 3 requests por minuto por IP
- Citas: 2 requests por 5 minutos por IP

### Idempotencia
Los recordatorios usan un sistema de hash para evitar duplicados:
```
notifications_log/{hash}
```

## 📱 Endpoints Disponibles

### POST `/api/sendMail`
Formulario de contacto
```json
{
  "name": "Nombre Tutor",
  "email": "email@ejemplo.cl", 
  "message": "Mensaje de contacto",
  "turnstileToken": "token_turnstile"
}
```

### POST `/api/appointments/create`
Crear cita
```json
{
  "tutorName": "Nombre Tutor",
  "tutorRut": "12345678-9",
  "tutorEmail": "email@ejemplo.cl",
  "tutorPhone": "+56912345678",
  "tutorCommune": "Las Condes",
  "petName": "Nombre Mascota",
  "species": "perro",
  "sex": "macho",
  "birthDate": "2020-01-01",
  "desiredSlot": "Mañana (9:00-12:00)",
  "turnstileToken": "token_turnstile"
}
```

### POST `/api/notifications/test`
Probar plantillas (solo admin)
```json
{
  "email": "test@ejemplo.cl",
  "templateType": "vaccine",
  "patientData": {
    "tutorName": "Test",
    "patientName": "Mascota Test",
    "species": "perro"
  }
}
```

## 🗄️ Estructura Firestore

### Colección `patients/{patientId}`
```javascript
{
  name: "nombre_mascota",
  species: "perro",
  sex: "macho", 
  breed: "golden_retriever",
  age: 3,
  microchip: "123456789",
  tutorName: "Nombre Tutor",
  tutorEmail: "email@ejemplo.cl",
  tutorPhone: "+56912345678",
  tutorRut: "12345678-9",
  tutorCity: "Santiago",
  tutorAddress: "Dirección completa",
  anamnesisRemota: "...",
  lastUpdated: timestamp,
  createdAt: timestamp
}
```

### Subcolecciones
- `consultations/` - Consultas médicas
- `vaccines/` - Vacunas (con nextDose)
- `deworming/` - Desparasitaciones (con nextDose) 
- `exams/` - Órdenes y resultados de exámenes
- `certificates/` - Certificados emitidos

### Colección `appointments/{id}`
```javascript
{
  tutorName: "Nombre Tutor",
  tutorEmail: "email@ejemplo.cl",
  tutorPhone: "+56912345678",
  commune: "Las Condes",
  patientName: "Nombre Mascota",
  species: "perro",
  birthDate: "2020-01-01",
  desiredSlot: "Mañana",
  status: "pending",
  createdAt: timestamp
}
```

### Colección `notifications_log/{hash}`
```javascript
{
  sentAt: timestamp,
  details: { type: "vaccine", patientId: "123" },
  hash: "vaccine-123-2024-01-15"
}
```

## ⏰ Función Programada

La función `scheduleDailyReminders` se ejecuta diariamente a las 08:00 hora de Chile y procesa:

1. **Recordatorios de citas** (48h, 24h, hoy)
2. **Recordatorios de vacunas** (próximas en 7 días)
3. **Recordatorios de desparasitación** (próximas en 7 días)
4. **Seguimiento post-consulta** (7 días después sin control)
5. **Exámenes pendientes** (5 días sin resultado)

## 🛠️ Desarrollo y Testing

### Emulador Local
```bash
# Ejecutar emuladores
npm run serve

# URL emulador: http://localhost:5001/ale-veterinaria/us-central1/
```

### Logs de Functions
```bash
# Ver logs en tiempo real
firebase functions:log --follow

# Logs específicos
firebase functions:log --only sendMail
```

### Testing de Plantillas
Usa el endpoint `/api/notifications/test` para probar diferentes plantillas:
```bash
curl -X POST https://your-project.web.app/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.cl",
    "templateType": "appointment",
    "patientData": {
      "tutorName": "Test Tutor",
      "patientName": "Test Pet"
    }
  }'
```

## 🔐 Configuración de Zoho Mail

1. **Crear App Password:**
   - Ir a Zoho Mail > Settings > Security > App Passwords
   - Generar nueva contraseña para "Mail app"
   - Usar esta contraseña en `ZOHO_APP_PASS`

2. **Configuración SMTP:**
   - Host: `smtp.zoho.com`
   - Puerto: `465` (SSL)
   - Usuario: `contacto@aleveterinaria.cl`
   - Contraseña: App Password generada

## 🛡️ Configuración Cloudflare Turnstile

1. **Crear Sitio en Cloudflare:**
   - Panel Cloudflare > Turnstile > Add Site
   - Dominio: `aleveterinaria.cl`
   - Obtener Site Key y Secret Key

2. **Configurar Keys:**
   - Site Key: En HTML `data-sitekey=""`
   - Secret Key: En Firebase Secret `TURNSTILE_SECRET_KEY`

## 📞 Soporte

Para dudas sobre la implementación:
- 📧 Email: contacto@aleveterinaria.cl
- 💬 WhatsApp: +569 76040797
- 📸 Instagram: @aleveterinaria

---

## ⚠️ Notas Importantes

- **No incluir credenciales en el código fuente**
- **Usar Firebase Secrets para todas las claves**
- **Probar en emulador antes de desplegar**
- **Verificar zona horaria America/Santiago**
- **Configurar dominios CORS correctamente**
- **Monitorear logs de Functions regularmente**

¡Sistema listo para usar! 🎉