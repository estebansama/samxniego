import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin
const initializeFirebaseAdmin = () => {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  }
}

// Middleware para verificar token JWT
const verifyAuthToken = async (request: NextRequest) => {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, error: "Token de autorización requerido", status: 401 }
    }

    const token = authHeader.replace("Bearer ", "")

    if (!token) {
      return { success: false, error: "Token no válido", status: 401 }
    }

    // Initialize Firebase Admin if not already done
    initializeFirebaseAdmin()

    // Verify the token
    const decodedToken = await getAuth().verifyIdToken(token)

    return { success: true, uid: decodedToken.uid, decodedToken }
  } catch (error: any) {
    console.error("Error verificando token:", error)

    let errorMessage = "Token inválido"
    if (error.code === "auth/id-token-expired") {
      errorMessage = "Token expirado"
    } else if (error.code === "auth/id-token-revoked") {
      errorMessage = "Token revocado"
    }

    return { success: false, error: errorMessage, status: 401 }
  }
}

// Schema para generar preguntas adaptativas
const PreguntaSchema = z.object({
  pregunta: z.string().describe("La pregunta, tema de debate o desafío adaptado al arquetipo del estudiante"),
  opciones: z.array(z.string()).describe("4 opciones de respuesta, argumentos o estrategias de equipo").optional(),
  respuestaCorrecta: z.string().describe("La respuesta correcta, posición ganadora o solución del equipo").optional(),
  explicacion: z.string().describe("Explicación educativa de la respuesta o reflexión del debate"),
  puntaje: z.number().describe("Puntos que otorga (15-50)"),
  tiempoSugerido: z.number().describe("Tiempo sugerido en segundos"),
  nivelDificultad: z.enum(["fácil", "medio", "difícil"]).describe("Nivel de dificultad"),
  habilidadCognitiva: z
    .enum(["recordar", "comprender", "aplicar", "analizar", "evaluar", "crear"])
    .describe("Habilidad cognitiva según Bloom"),
  tipoJuego: z.enum(["trivia", "debate", "equipo"]).describe("Tipo de minijuego"),
  equiposRequeridos: z.number().describe("Número de equipos para juegos colaborativos").optional(),
  argumentos: z.array(z.string()).describe("Argumentos base para debates").optional(),
  tareas: z.array(z.string()).describe("Tareas específicas para trabajo en equipo").optional(),
})

export async function GET(request: NextRequest) {
  // Verificar token de autenticación
  const authResult = await verifyAuthToken(request)
  if (!authResult.success) {
    return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status })
  }

  // El usuario está autenticado, continuar con la lógica original
  const { uid } = authResult

  // Resto de la lógica original...
  try {
    const { searchParams } = new URL(request.url)
    const arquetipo = searchParams.get("arquetipo")
    const materia = searchParams.get("materia")
    const tema = searchParams.get("tema")
    const dificultad = searchParams.get("dificultad")

    // Simular generación de pregunta personalizada
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generar contenido según el arquetipo
    let preguntaGenerada
    let opciones
    let respuestaCorrecta
    let explicacion
    let habilidadCognitiva

    if (arquetipo === "debatidor") {
      preguntaGenerada = `🏛️ DEBATE: ¿La tecnología mejora o perjudica el aprendizaje en ${materia}?`
      return NextResponse.json({
        success: true,
        tipo: "debate",
        pregunta: preguntaGenerada,
        argumentos: [
          `A favor: La tecnología hace ${materia} más accesible e interactiva`,
          `En contra: La tecnología puede distraer del aprendizaje profundo en ${materia}`,
        ],
        tiempoSugerido: 300,
        generadoPorIA: true,
      })
    }

    if (arquetipo === "colaborativo") {
      preguntaGenerada = `👥 PROYECTO COLABORATIVO: Diseñen una solución innovadora para un problema de ${materia}`
      return NextResponse.json({
        success: true,
        tipo: "equipo",
        pregunta: preguntaGenerada,
        tareas: [
          "Investigador: Analizar el problema desde múltiples ángulos",
          "Diseñador: Proponer soluciones creativas e innovadoras",
          "Evaluador: Analizar viabilidad y efectividad de propuestas",
          "Comunicador: Preparar presentación clara y convincente",
        ],
        equiposRequeridos: 3,
        tiempoSugerido: 600,
        generadoPorIA: true,
      })
    }

    // Para otros arquetipos, generar trivia
    switch (arquetipo) {
      case "gamer":
        preguntaGenerada = `🎮 DESAFÍO GAMER: ¿Cuál es la estrategia más efectiva para resolver problemas de ${materia}?`
        opciones = [
          "Aplicar fórmulas memorizadas sin entender",
          "Analizar el problema paso a paso y aplicar conceptos",
          "Copiar soluciones de otros",
          "Resolver al azar hasta encontrar la respuesta",
        ]
        respuestaCorrecta = "Analizar el problema paso a paso y aplicar conceptos"
        habilidadCognitiva = "Resolución de problemas"
        break

      case "creativo":
        preguntaGenerada = `🎨 DESAFÍO CREATIVO: ¿Cómo puedes expresar creativamente los conceptos de ${materia}?`
        opciones = [
          "Solo memorizando definiciones",
          "Creando mapas mentales, diagramas y analogías visuales",
          "Leyendo únicamente el libro de texto",
          "Evitando cualquier representación visual",
        ]
        respuestaCorrecta = "Creando mapas mentales, diagramas y analogías visuales"
        habilidadCognitiva = "Pensamiento creativo"
        break

      case "analítico":
      default:
        preguntaGenerada = `🧠 ANÁLISIS PROFUNDO: ¿Cuál es la relación fundamental entre los conceptos clave de ${materia}?`
        opciones = [
          "No existe relación entre los conceptos",
          "Los conceptos están interconectados y se refuerzan mutuamente",
          "Solo algunos conceptos se relacionan ocasionalmente",
          "La relación es irrelevante para el aprendizaje",
        ]
        respuestaCorrecta = "Los conceptos están interconectados y se refuerzan mutuamente"
        habilidadCognitiva = "Pensamiento analítico"
        break
    }

    explicacion = `En ${materia}, es fundamental comprender cómo los diferentes elementos se conectan para formar un conocimiento integral y aplicable.`

    return NextResponse.json({
      success: true,
      pregunta: preguntaGenerada,
      opciones,
      respuestaCorrecta,
      explicacion,
      puntaje: 25,
      habilidadCognitiva,
      tiempoSugerido: 60,
      generadoPorIA: true,
      proveedorIA: "OpenAI GPT-4",
      arquetipoDetectado: arquetipo,
      materiaAdaptada: materia,
    })
  } catch (error) {
    console.error("Error generando minijuego:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error al generar pregunta personalizada",
        fallback: true,
      },
      { status: 500 },
    )
  }
}
// Función mejorada para generar preguntas simuladas más inteligentes
function generarPreguntaSimulada(
  arquetipo: string,
  materia: string,
  tema = "",
  dificultad = "medio",
  errorType?: string,
) {
  const preguntasInteligentes = {
    gamer: {
      Matemáticas: [
        {
          pregunta:
            "🎮 DESAFÍO MATEMÁTICO: Un jugador tiene 150 monedas y gasta 3/5 en mejoras. ¿Cuántas monedas le quedan para el siguiente nivel?",
          opciones: ["90 monedas", "60 monedas", "100 monedas", "75 monedas"],
          respuestaCorrecta: "60 monedas",
          explicacion: "150 × 3/5 = 90 monedas gastadas. 150 - 90 = 60 monedas restantes. ¡Misión completada! 🏆",
          habilidadCognitiva: "aplicar",
          tipoJuego: "trivia",
        },
        {
          pregunta:
            "🎯 BOSS BATTLE: Para derrotar al jefe final necesitas resolver: Si x² - 5x + 6 = 0, ¿cuáles son los valores de x?",
          opciones: ["x = 2, x = 3", "x = 1, x = 6", "x = -2, x = -3", "x = 0, x = 5"],
          respuestaCorrecta: "x = 2, x = 3",
          explicacion: "Factorizando: (x-2)(x-3) = 0, entonces x = 2 o x = 3. ¡Boss derrotado! 💪",
          habilidadCognitiva: "analizar",
          tipoJuego: "trivia",
        },
      ],
      Historia: [
        {
          pregunta:
            "⚔️ BATALLA HISTÓRICA: En 1939 comenzó una guerra que cambió el mundo. ¿Cuál fue el evento que activó este conflicto global?",
          opciones: ["Invasión de Polonia", "Ataque a Pearl Harbor", "Batalla de Francia", "Operación Barbarroja"],
          respuestaCorrecta: "Invasión de Polonia",
          explicacion:
            "La invasión alemana de Polonia el 1 de septiembre de 1939 fue el evento que desencadenó la Segunda Guerra Mundial. ¡Historia desbloqueada! 📚",
          habilidadCognitiva: "recordar",
          tipoJuego: "trivia",
        },
      ],
      Literatura: [
        {
          pregunta:
            "📖 QUEST LITERARIA: En el universo de García Márquez, ¿qué obra maestra narra la saga de los Buendía?",
          opciones: [
            "Cien años de soledad",
            "El amor en los tiempos del cólera",
            "Crónica de una muerte anunciada",
            "La hojarasca",
          ],
          respuestaCorrecta: "Cien años de soledad",
          explicacion:
            "'Cien años de soledad' es la obra cumbre que narra la historia de la familia Buendía en Macondo. ¡Logro literario desbloqueado! 🏅",
          habilidadCognitiva: "recordar",
          tipoJuego: "trivia",
        },
      ],
    },
    creativo: {
      Literatura: [
        {
          pregunta:
            "🎨 CREATIVIDAD LITERARIA: Si fueras a reescribir Romeo y Julieta en el siglo XXI, ¿qué elemento sería el equivalente moderno del balcón?",
          opciones: ["Redes sociales", "Videollamadas", "Mensajes de texto", "Todas las anteriores"],
          respuestaCorrecta: "Todas las anteriores",
          explicacion:
            "La tecnología moderna ofrece múltiples formas de comunicación íntima que pueden recrear la magia del balcón clásico. ¡Tu creatividad no tiene límites! ✨",
          habilidadCognitiva: "crear",
          tipoJuego: "trivia",
        },
      ],
      Matemáticas: [
        {
          pregunta:
            "🎭 ARTE MATEMÁTICO: Un artista quiere crear un mural con proporciones áureas. Si la base mide 8 metros, ¿cuánto debe medir la altura?",
          opciones: ["4.94 metros", "12.94 metros", "6.18 metros", "10 metros"],
          respuestaCorrecta: "4.94 metros",
          explicacion:
            "La proporción áurea es aproximadamente 1.618. Entonces 8 ÷ 1.618 ≈ 4.94 metros. ¡Arte y matemáticas en perfecta armonía! 🎨",
          habilidadCognitiva: "aplicar",
          tipoJuego: "trivia",
        },
      ],
    },
    analítico: {
      Ciencias: [
        {
          pregunta:
            "🔬 ANÁLISIS CIENTÍFICO: Si la densidad del agua es 1 g/cm³ y un objeto flota, ¿qué puedes concluir sobre su densidad?",
          opciones: ["Es mayor que 1 g/cm³", "Es menor que 1 g/cm³", "Es igual a 1 g/cm³", "No se puede determinar"],
          respuestaCorrecta: "Es menor que 1 g/cm³",
          explicacion:
            "Por el principio de Arquímedes, un objeto flota cuando su densidad es menor que la del fluido. Análisis correcto! 🧪",
          habilidadCognitiva: "analizar",
          tipoJuego: "trivia",
        },
      ],
      Matemáticas: [
        {
          pregunta:
            "📊 ANÁLISIS DE DATOS: Observa la secuencia: 2, 6, 18, 54... ¿Cuál es el patrón y el siguiente término?",
          opciones: [
            "Multiplicar por 3; siguiente: 162",
            "Sumar 4; siguiente: 58",
            "Multiplicar por 2; siguiente: 108",
            "Sumar múltiplos de 4; siguiente: 70",
          ],
          respuestaCorrecta: "Multiplicar por 3; siguiente: 162",
          explicacion:
            "Cada término se multiplica por 3: 2×3=6, 6×3=18, 18×3=54, 54×3=162. ¡Patrón identificado correctamente! 🎯",
          habilidadCognitiva: "analizar",
          tipoJuego: "trivia",
        },
      ],
    },
    debatidor: {
      Historia: [
        {
          pregunta: "🏛️ GRAN DEBATE: ¿La Revolución Francesa fue más beneficiosa o perjudicial para la sociedad?",
          tipoJuego: "debate",
          argumentos: [
            "A favor: Estableció derechos fundamentales y eliminó privilegios aristocráticos",
            "En contra: Causó violencia extrema y inestabilidad social prolongada",
          ],
          explicacion:
            "Ambas perspectivas tienen mérito histórico. La evaluación debe considerar consecuencias a corto y largo plazo.",
          habilidadCognitiva: "evaluar",
        },
      ],
      Literatura: [
        {
          pregunta: "📚 DEBATE LITERARIO: ¿Los finales abiertos en las novelas son superiores a los finales cerrados?",
          tipoJuego: "debate",
          argumentos: [
            "Finales abiertos: Permiten interpretación personal y reflexión continua",
            "Finales cerrados: Proporcionan satisfacción narrativa y resolución completa",
          ],
          explicacion: "La efectividad depende del propósito narrativo y la experiencia que busca crear el autor.",
          habilidadCognitiva: "evaluar",
        },
      ],
    },
    colaborativo: {
      Ciencias: [
        {
          pregunta: "🔬 PROYECTO DE EQUIPO: Diseñen un experimento para probar la calidad del agua local",
          tipoJuego: "equipo",
          equiposRequeridos: 4,
          tareas: [
            "Investigador: Buscar métodos de análisis de agua",
            "Experimentador: Diseñar el procedimiento",
            "Analista: Interpretar resultados",
            "Comunicador: Presentar hallazgos",
          ],
          explicacion:
            "El trabajo en equipo permite abordar problemas complejos desde múltiples perspectivas especializadas.",
          habilidadCognitiva: "crear",
        },
      ],
      Matemáticas: [
        {
          pregunta: "📊 DESAFÍO GRUPAL: Calculen el presupuesto para un evento escolar con $500",
          tipoJuego: "equipo",
          equiposRequeridos: 3,
          tareas: [
            "Contador: Calcular costos de comida y bebidas",
            "Coordinador: Estimar gastos de decoración y entretenimiento",
            "Tesorero: Balancear el presupuesto final",
          ],
          explicacion: "La planificación financiera colaborativa enseña responsabilidad y matemáticas aplicadas.",
          habilidadCognitiva: "aplicar",
        },
      ],
    },
  }

  // Seleccionar pregunta basada en arquetipo y materia
  const preguntasPorArquetipo =
    preguntasInteligentes[arquetipo as keyof typeof preguntasInteligentes] || preguntasInteligentes.gamer
  const preguntasPorMateria =
    preguntasPorArquetipo[materia as keyof typeof preguntasPorArquetipo] ||
    Object.values(preguntasPorArquetipo)[0] ||
    []

  const preguntaSeleccionada =
    Array.isArray(preguntasPorMateria) && preguntasPorMateria.length > 0
      ? preguntasPorMateria[Math.floor(Math.random() * preguntasPorMateria.length)]
      : {
          pregunta: `¿Cuál es un concepto importante en ${materia}?`,
          opciones: ["Concepto A", "Concepto B", "Concepto C", "Concepto D"],
          respuestaCorrecta: "Concepto A",
          explicacion: `Este es un concepto fundamental en ${materia}.`,
          habilidadCognitiva: "comprender",
          tipoJuego: "trivia",
        }

  // Ajustar puntaje según dificultad
  const puntajeBase = {
    fácil: 20,
    medio: 30,
    difícil: 40,
  }

  // Mensajes más informativos según el tipo de error
  const mensajes = {
    quota_exceeded: "🤖 Modo Simulado Activo - Cuota de OpenAI temporalmente excedida. ¡Sigue jugando!",
    rate_limit: "🤖 Modo Simulado Activo - Límite de velocidad de OpenAI alcanzado. ¡Contenido igual de bueno!",
    api_key_error: "🤖 Modo Simulado Activo - Configuración de API pendiente. ¡Experiencia completa disponible!",
    api_error: "🤖 Modo Simulado Activo - Error temporal de IA. ¡Preguntas inteligentes disponibles!",
    general_error: "🤖 Modo Simulado Activo - Funcionando offline. ¡Diversión garantizada!",
    default: "🤖 Modo Simulado Activo - Configura OPENAI_API_KEY para IA real",
  }

  return NextResponse.json({
    success: true,
    id: Math.floor(Math.random() * 1000),
    materia,
    arquetipo,
    tema: tema || `Conceptos de ${materia}`,
    ...preguntaSeleccionada,
    puntaje: puntajeBase[dificultad as keyof typeof puntajeBase] || 25,
    tiempoSugerido: 30,
    nivelDificultad: dificultad,
    generadoPorIA: false,
    simuladorInteligente: true,
    nota: mensajes[errorType as keyof typeof mensajes] || mensajes.default,
  })
}
