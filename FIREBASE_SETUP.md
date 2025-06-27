# Configuración de Firebase para Clasio

Esta guía te ayudará a configurar Firebase para la aplicación Clasio.

## Prerrequisitos

- Cuenta de Google
- Acceso a [Firebase Console](https://console.firebase.google.com/)
- Node.js instalado en tu sistema

## Paso 1: Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear un proyecto"
3. Nombra tu proyecto (ej: "clasio-app")
4. Acepta los términos y condiciones
5. Configura Google Analytics (opcional)
6. Haz clic en "Crear proyecto"

## Paso 2: Configurar Authentication

1. En el panel izquierdo, haz clic en "Authentication"
2. Ve a la pestaña "Sign-in method"
3. Habilita "Correo electrónico/contraseña"
4. Guarda los cambios

## Paso 3: Configurar Firestore Database

1. En el panel izquierdo, haz clic en "Firestore Database"
2. Haz clic en "Crear base de datos"
3. Selecciona "Comenzar en modo de prueba" (por ahora)
4. Elige una ubicación (recomendado: us-central1)
5. Haz clic en "Listo"

## Paso 4: Obtener Configuración Web

1. En "Configuración del proyecto" (ícono de engranaje)
2. Ve a la pestaña "General"
3. En "Tus aplicaciones", haz clic en "Web" (</>)
4. Registra tu aplicación con un nombre
5. Copia la configuración que aparece

## Paso 5: Configurar Variables de Entorno

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con tu configuración de Firebase:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
\`\`\`

## Paso 6: Configurar Firebase Admin (Servidor)

1. Ve a "Configuración del proyecto" > "Cuentas de servicio"
2. Haz clic en "Generar nueva clave privada"
3. Descarga el archivo JSON
4. Copia los valores al archivo `.env.local`:

\`\`\`env
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu_proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu_clave_privada_aqui\n-----END PRIVATE KEY-----\n"
\`\`\`

## Paso 7: Configurar Reglas de Seguridad

### Firestore Rules

Ve a Firestore > Reglas y reemplaza con:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer y escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Permitir lectura de datos públicos
    match /cursos/{document=**} {
      allow read: if request.auth != null;
    }
    
    match /minijuegos/{document=**} {
      allow read: if request.auth != null;
    }
    
    // Los docentes pueden crear contenido
    match /contenido/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tipo == 'docente';
    }
  }
}
\`\`\`

### Storage Rules (si usas Storage)

Ve a Storage > Reglas y reemplaza con:

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

## Paso 8: Verificar Configuración

Ejecuta el script de verificación:

\`\`\`bash
npm run verify-firebase
\`\`\`

Si todo está configurado correctamente, deberías ver:
- ✅ Todas las variables configuradas
- ✅ Formato de API Key válido
- ✅ Project ID válido

## Paso 9: Probar Firestore

Ejecuta el script de prueba:

\`\`\`bash
npm run test-firestore
\`\`\`

Esto verificará:
- ✅ Conexión a Firebase Admin
- ✅ Operaciones de lectura/escritura en Firestore
- ✅ Creación de documentos de usuario

## Estructura de Datos

### Colección `users`

\`\`\`javascript
{
  uid: "user_id_from_auth",
  email: "usuario@ejemplo.com",
  nombre: "Nombre Usuario",
  tipo: "alumno" | "docente" | "padre",
  curso: "1A", // solo para alumnos
  puntos: 0,
  nivel: 1,
  arquetipo: "gamer" | "explorador" | "competitivo",
  fechaCreacion: "2024-01-01T00:00:00.000Z",
  activo: true
}
\`\`\`

### Colección `cursos`

\`\`\`javascript
{
  id: "1A",
  nombre: "Primer Año A",
  docente: "docente_uid",
  alumnos: ["alumno1_uid", "alumno2_uid"],
  activo: true
}
\`\`\`

## Solución de Problemas

### Error: "Permission denied"
- Verifica que las reglas de Firestore permitan la operación
- Asegúrate de que el usuario esté autenticado

### Error: "Project not found"
- Verifica que el PROJECT_ID sea correcto
- Asegúrate de que el proyecto existe en Firebase Console

### Error: "Invalid API key"
- Verifica que la API key sea correcta
- Asegúrate de que no tenga espacios extra

### Error: "Auth domain mismatch"
- Verifica que el AUTH_DOMAIN coincida con tu proyecto
- Formato: `tu-proyecto.firebaseapp.com`

## Comandos Útiles

\`\`\`bash
# Verificar configuración
npm run verify-firebase

# Probar Firestore
npm run test-firestore

# Iniciar aplicación
npm run dev

# Ver logs de Firebase (en consola del navegador)
# Abre DevTools > Console
\`\`\`

## Recursos Adicionales

- [Documentación de Firebase](https://firebase.google.com/docs)
- [Guía de Firestore](https://firebase.google.com/docs/firestore)
- [Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

## Soporte

Si tienes problemas con la configuración:

1. Ejecuta `npm run verify-firebase` para diagnosticar
2. Revisa los logs en la consola del navegador
3. Verifica que todas las variables estén en `.env.local`
4. Asegúrate de que las reglas de Firestore sean correctas
