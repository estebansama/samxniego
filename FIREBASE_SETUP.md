# Configuración de Firebase para Clasio

Esta guía te ayudará a configurar Firebase para la aplicación Clasio.

## 📋 Requisitos Previos

- Una cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)
- Node.js instalado en tu sistema

## 🚀 Configuración Paso a Paso

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Ingresa el nombre del proyecto: `clasio-app` (o el nombre que prefieras)
4. Acepta los términos y condiciones
5. Configura Google Analytics (opcional pero recomendado)
6. Haz clic en "Crear proyecto"

### 2. Configurar Authentication

1. En el panel izquierdo, ve a **Authentication**
2. Haz clic en "Comenzar"
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/Password**:
   - Haz clic en "Email/Password"
   - Activa la primera opción (Email/Password)
   - Guarda los cambios

### 3. Configurar Firestore Database

1. En el panel izquierdo, ve a **Firestore Database**
2. Haz clic en "Crear base de datos"
3. Selecciona **Comenzar en modo de prueba** (por ahora)
4. Elige una ubicación (recomendado: us-central)
5. Haz clic en "Listo"

### 4. Configurar Reglas de Seguridad

#### Reglas de Firestore

Ve a **Firestore Database > Reglas** y reemplaza el contenido con:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer y escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Datos públicos de usuarios (solo lectura para otros)
    match /users/{userId} {
      allow read: if request.auth != null;
    }
    
    // Minijuegos - los usuarios pueden crear y leer
    match /minijuegos/{gameId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null && request.auth.uid == resource.data.createdBy;
    }
    
    // Votaciones - los usuarios pueden participar
    match /votaciones/{voteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    
    // Informes - solo lectura para usuarios autenticados
    match /informes/{reportId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }
  }
}
\`\`\`

#### Reglas de Storage (si usas Firebase Storage)

Ve a **Storage > Reglas** y configura:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

### 5. Obtener Configuración del Proyecto

1. Ve a **Configuración del proyecto** (ícono de engranaje)
2. En la pestaña **General**, baja hasta "Tus aplicaciones"
3. Haz clic en "Agregar aplicación" y selecciona **Web** (<//>)
4. Ingresa un nombre para tu aplicación: `clasio-web`
5. **NO** marques "También configurar Firebase Hosting"
6. Haz clic en "Registrar aplicación"
7. Copia la configuración que aparece

### 6. Configurar Variables de Entorno

1. En tu proyecto, copia `.env.example` a `.env.local`:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`

2. Reemplaza los valores en `.env.local` con tu configuración de Firebase:

\`\`\`env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
\`\`\`

### 7. Configurar Firebase Admin SDK (Opcional)

Para operaciones del servidor, necesitas configurar el Admin SDK:

1. Ve a **Configuración del proyecto > Cuentas de servicio**
2. Haz clic en "Generar nueva clave privada"
3. Se descargará un archivo JSON
4. Abre el archivo y copia los valores:

\`\`\`env
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada_aqui\n-----END PRIVATE KEY-----"
\`\`\`

**⚠️ Importante**: Mantén la clave privada segura y nunca la subas a repositorios públicos.

### 8. Verificar Configuración

Ejecuta el script de verificación:

\`\`\`bash
npm run verify-firebase
\`\`\`

Este script verificará que todas las variables estén configuradas correctamente.

### 9. Probar la Aplicación

1. Inicia el servidor de desarrollo:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Ve a `http://localhost:3000/register`
3. Intenta registrar un usuario
4. Verifica en Firebase Console que el usuario se creó correctamente

## 🔧 Configuración Adicional

### Configurar Dominios Autorizados

1. Ve a **Authentication > Settings**
2. En "Authorized domains", agrega:
   - `localhost` (para desarrollo)
   - Tu dominio de producción

### Configurar Índices de Firestore

Si tu aplicación requiere consultas complejas, es posible que necesites crear índices:

1. Ve a **Firestore Database > Índices**
2. Firebase te sugerirá índices automáticamente cuando ejecutes consultas que los requieran

### Configurar Límites y Cuotas

1. Ve a **Configuración del proyecto > Uso y facturación**
2. Configura alertas de presupuesto si es necesario
3. Revisa los límites del plan gratuito

## 🚨 Solución de Problemas

### Error: "Firebase not configured"

- Verifica que todas las variables de entorno estén configuradas
- Ejecuta `npm run verify-firebase` para diagnosticar problemas

### Error: "Permission denied"

- Revisa las reglas de seguridad de Firestore
- Asegúrate de que el usuario esté autenticado

### Error: "Network request failed"

- Verifica tu conexión a internet
- Revisa que los dominios estén autorizados en Firebase

### Error: "Invalid API key"

- Verifica que la API key sea correcta
- Asegúrate de que la aplicación web esté habilitada en Firebase

## 📚 Recursos Adicionales

- [Documentación oficial de Firebase](https://firebase.google.com/docs)
- [Guía de Authentication](https://firebase.google.com/docs/auth)
- [Guía de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de seguridad](https://firebase.google.com/docs/rules)

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Revisa los logs de la consola del navegador
2. Ejecuta `npm run verify-firebase` para diagnosticar
3. Consulta la documentación oficial de Firebase
4. Revisa que todas las variables de entorno estén correctamente configuradas

---

**Nota**: Esta configuración es para desarrollo. Para producción, asegúrate de:
- Configurar reglas de seguridad más estrictas
- Habilitar la facturación si es necesario
- Configurar monitoreo y alertas
- Implementar backups regulares
