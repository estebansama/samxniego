# Clasio App

Clasio es una plataforma educativa innovadora que transforma el celular en un aliado educativo mediante inteligencia artificial, gamificación y personalización para revolucionar la experiencia de aprendizaje en colegios secundarios.

## 🚀 Características Principales

### Para Estudiantes
- **Minijuegos Educativos**: Actividades gamificadas adaptadas a diferentes estilos de aprendizaje
- **Sistema de Puntos**: Recompensas por participación y logros académicos
- **Debates Virtuales**: Sesiones de debate estructuradas con IA
- **Trabajo Colaborativo**: Proyectos en equipo con roles definidos
- **Sistema de Votaciones**: Participación democrática en decisiones estudiantiles

### Para Docentes
- **Generador de Contenido con IA**: Creación automática de minijuegos desde cualquier material
- **Panel de Control**: Monitoreo del progreso estudiantil en tiempo real
- **Personalización**: Adaptación de contenido según arquetipos de aprendizaje
- **Análisis Predictivo**: Insights sobre rendimiento y engagement

### Para Padres
- **Informes Inteligentes**: Reportes detallados generados con IA
- **Seguimiento en Tiempo Real**: Monitoreo del progreso académico
- **Recomendaciones Personalizadas**: Sugerencias para mejorar el aprendizaje
- **Métricas de Participación**: Análisis de atención y engagement

## 🛠️ Tecnologías Utilizadas

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de Datos**: Firebase Firestore
- **Autenticación**: Firebase Auth
- **IA**: OpenAI GPT-4 (integración preparada)
- **Gráficos**: Recharts
- **Iconos**: Lucide React

## 📦 Instalación

1. **Clonar el repositorio**
   \`\`\`bash
   git clone https://github.com/tu-usuario/clasio-app.git
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
   
   Completar las variables de Firebase y OpenAI en `.env.local`

4. **Ejecutar en desarrollo**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Abrir en el navegador**
   \`\`\`
   http://localhost:3000
   \`\`\`

## 🔧 Configuración de Firebase

1. Crear un proyecto en [Firebase Console](https://console.firebase.google.com)
2. Habilitar Authentication y Firestore
3. Obtener las credenciales del proyecto
4. Configurar las variables de entorno según `.env.example`

Ver `FIREBASE_SETUP.md` para instrucciones detalladas.

## 🎮 Modo Demo

La aplicación incluye un modo demo completo que funciona sin configuración de Firebase:

- **Datos simulados**: Usuarios, minijuegos, propuestas de votación
- **IA simulada**: Generación de contenido y análisis predictivo
- **Funcionalidad completa**: Todas las características disponibles

## 📱 Arquetipos de Aprendizaje

Clasio identifica y adapta el contenido según diferentes arquetipos:

- **🎮 Gamer**: Prefiere elementos de juego y competencia
- **🎨 Creativo**: Aprende mejor con actividades artísticas y expresivas
- **🧠 Analítico**: Disfruta de problemas lógicos y análisis profundo
- **💬 Debatidor**: Se motiva con discusiones y argumentación
- **👥 Colaborativo**: Prefiere trabajo en equipo y proyectos grupales

## 🏗️ Estructura del Proyecto

\`\`\`
clasio-app/
├── app/                    # Páginas y rutas de Next.js
│   ├── alumno/            # Panel del estudiante
│   ├── docente/           # Panel del docente
│   ├── padre/             # Panel de padres
│   ├── votaciones/        # Sistema de votaciones
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── debate-session.tsx
│   └── team-challenge.tsx
├── lib/                   # Utilidades y configuración
│   ├── firebase.ts
│   ├── firebase-admin.ts
│   └── firestore.ts
├── hooks/                 # Custom hooks
└── scripts/              # Scripts de utilidad
\`\`\`

## 🚀 Despliegue

### Vercel (Recomendado)
1. Conectar el repositorio a Vercel
2. Configurar las variables de entorno
3. Desplegar automáticamente

### Otros Proveedores
La aplicación es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- DigitalOcean App Platform

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: Ver archivos en `/docs`
- **Issues**: Reportar problemas en GitHub Issues
- **Discusiones**: GitHub Discussions para preguntas generales

## 🔮 Roadmap

- [ ] Integración con más proveedores de IA
- [ ] App móvil nativa
- [ ] Realidad aumentada para experimentos
- [ ] Análisis de voz y emociones
- [ ] Integración con sistemas LMS existentes
- [ ] Modo offline completo
- [ ] Soporte multi-idioma

---

**Clasio** - Transformando la educación con tecnología 🚀
