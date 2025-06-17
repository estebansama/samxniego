# Clasio App - Plataforma Educativa con IA

Una plataforma educativa innovadora que combina inteligencia artificial, gamificación y colaboración para transformar la experiencia de aprendizaje en colegios secundarios.

## 🚀 Características Principales

- **IA Educativa**: Generación automática de contenido personalizado
- **Gamificación**: Sistema de puntos, niveles y logros
- **Debates Estructurados**: Sesiones de debate con argumentación crítica
- **Trabajo Colaborativo**: Proyectos de equipo con roles específicos
- **Sistema de Votaciones**: Propuestas estudiantiles democráticas
- **Informes Inteligentes**: Análisis de progreso con IA

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **IA**: OpenAI GPT-4, Google Gemini
- **UI**: shadcn/ui, Radix UI, Lucide Icons

## 📦 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd clasio-app
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Completa las variables de entorno:
- Firebase Configuration (Client & Admin)
- OpenAI API Key
- Google Gemini API Key

4. **Configurar Firebase**
- Crear proyecto en [Firebase Console](https://console.firebase.google.com)
- Habilitar Authentication (Email/Password)
- Crear base de datos Firestore
- Generar service account key para Admin SDK

5. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## 🔧 Configuración de Firebase

### 1. Configuración del Cliente
Agrega estas variables a tu `.env.local`:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
\`\`\`

### 2. Configuración del Admin SDK
\`\`\`env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
\`\`\`

### 3. Reglas de Firestore
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Minijuegos públicos para lectura, solo creadores pueden escribir
    match /minijuegos/{minijuegoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.creadorId == request.auth.uid);
    }
    
    // Puntuaciones solo del usuario autenticado
    match /puntuaciones/{puntuacionId} {
      allow read, write: if request.auth != null && 
        resource.data.usuarioId == request.auth.uid;
    }
    
    // Propuestas públicas para lectura, autenticados pueden crear
    match /propuestas/{propuestaId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.autorId == request.auth.uid || 
         request.writeFields.hasOnly(['votos', 'votantes']));
    }
  }
}
\`\`\`

## 📊 Estructura de Datos

### Usuarios
\`\`\`typescript
interface UserProfile {
  uid: string
  email: string
  nombre: string
  tipo: 'docente' | 'alumno' | 'padre'
  curso?: string
  materias?: string[]
  arquetipo?: string
  nivel?: number
  puntos?: number
  fechaCreacion: string
}
\`\`\`

### Minijuegos
\`\`\`typescript
interface Minijuego {
  id: string
  titulo: string
  descripcion: string
  tipo: 'trivia' | 'debate' | 'equipo'
  materia: string
  dificultad: 'Fácil' | 'Medio' | 'Difícil'
  preguntas: any[]
  creadorId: string
  fechaCreacion: Date
  activo: boolean
}
\`\`\`

## 🎮 Tipos de Juegos

### 1. Trivia Adaptativa
- Preguntas personalizadas según arquetipo del estudiante
- Múltiples niveles de dificultad
- Explicaciones educativas detalladas

### 2. Debates Estructurados
- Temas educativos controvertidos
- Argumentos base para ambas posiciones
- Sistema de votación y evaluación

### 3. Proyectos Colaborativos
- Desafíos que requieren trabajo en equipo
- Roles específicos para cada miembro
- Objetivos compartidos y métricas de éxito

## 🔐 Autenticación y Seguridad

- Autenticación con Firebase Auth
- Tokens JWT para API routes
- Reglas de seguridad en Firestore
- Validación de datos en cliente y servidor

## 📈 Analíticas y Reportes

- Seguimiento de progreso individual
- Estadísticas de participación
- Informes generados con IA
- Métricas de rendimiento por materia

## 🚀 Despliegue

### Vercel (Recomendado)
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables de entorno en tu plataforma de despliegue.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

Para soporte y preguntas:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo

---

**Clasio** - Transformando la educación con tecnología 🚀
