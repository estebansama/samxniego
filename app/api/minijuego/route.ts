import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
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
    const arquetipo = searchParams.get("arquetipo") || "gamer"
    const materia = searchParams.get("materia") || "Matemáticas"
    const tema = searchParams.get("tema") || ""
    const dificultad = searchParams.get("dificultad") || "medio"

    // Si no hay API key o hay problemas, usar datos simulados mejorados
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
      console.log("OpenAI API key no configurada, generando pregunta simulada inteligente")
      return generarPreguntaSimulada(arquetipo, materia, tema, dificultad)
    }

    try {
      // Definir características de cada arquetipo
      const arquetipos = {
        gamer: {
          descripcion: "Le gustan los desafíos, la competencia sana, elementos de juego, progresión clara",
          estilo: "Preguntas con narrativa de desafío, elementos de 'misión', lenguaje dinámico",
        },
        creativo: {
          descripcion: "Prefiere expresión personal, conexiones innovadoras, múltiples perspectivas",
          estilo: "Preguntas abiertas, que permitan creatividad, con contextos imaginativos",
        },
        analítico: {
          descripcion: "Disfruta del pensamiento lógico, resolución de problemas, análisis detallado",
          estilo: "Preguntas que requieren razonamiento paso a paso, análisis de datos, lógica",
        },
        social: {
          descripcion: "Aprende mejor en contextos colaborativos, situaciones reales, impacto social",
          estilo: "Preguntas con contexto social, trabajo en equipo, aplicaciones del mundo real",
        },
        debatidor: {
          descripcion: "Disfruta la argumentación, el análisis crítico, la persuasión y el intercambio de ideas",
          estilo: "Preguntas controvertidas, análisis de perspectivas múltiples, construcción de argumentos",
        },
        colaborativo: {
          descripcion:
            "Aprende mejor trabajando en equipo, resolviendo problemas grupales, compartiendo responsabilidades",
          estilo: "Desafíos que requieren colaboración, roles específicos, objetivos compartidos",
        },
      }

      const arquetipoInfo = arquetipos[arquetipo as keyof typeof arquetipos] || arquetipos.gamer

      let prompt = `Genera una pregunta educativa para un estudiante de secundaria con las siguientes características:

MATERIA: ${materia}
TEMA ESPECÍFICO: ${tema || "Conceptos generales de " + materia}
ARQUETIPO DEL ESTUDIANTE: ${arquetipo}
- Descripción: ${arquetipoInfo.descripcion}
- Estilo preferido: ${arquetipoInfo.estilo}

NIVEL DE DIFICULTAD: ${dificultad}

INSTRUCCIONES:
1. Crea una pregunta que se adapte perfectamente al estilo de aprendizaje del arquetipo
2. Asegúrate de que sea educativamente valiosa y no trivial
3. Las opciones deben ser plausibles pero con una respuesta claramente correcta
4. La explicación debe ser clara y educativa
5. Adapta el lenguaje y contexto al arquetipo del estudiante

EJEMPLO PARA GAMER: "🎮 MISIÓN: Resuelve este desafío matemático para desbloquear el siguiente nivel..."
EJEMPLO PARA CREATIVO: "🎨 Imagina que eres un artista que necesita calcular las proporciones perfectas..."
EJEMPLO PARA ANALÍTICO: "🔍 Analiza los siguientes datos y determina la solución más lógica..."
EJEMPLO PARA SOCIAL: "👥 En tu comunidad se presenta esta situación, ¿cómo la resolverías?..."`

      if (arquetipo === "debatidor" || dificultad === "debate") {
        prompt += `

FORMATO ESPECIAL PARA DEBATE:
- Presenta un tema controvertido pero educativo
- Proporciona argumentos base para ambas posiciones
- Fomenta el pensamiento crítico y la argumentación estructurada
- Incluye preguntas que evalúen la calidad de los argumentos
- Ejemplo: "🏛️ GRAN DEBATE: ¿Deberían las redes sociales ser reguladas por el gobierno?"`
      }

      if (arquetipo === "colaborativo" || dificultad === "equipo") {
        prompt += `

FORMATO ESPECIAL PARA TRABAJO EN EQUIPO:
- Crea un desafío que requiera colaboración entre estudiantes
- Divide el problema en tareas específicas para cada miembro
- Incluye objetivos compartidos y métricas de éxito grupal
- Fomenta la comunicación y coordinación entre miembros
- Ejemplo: "👥 MISIÓN DE EQUIPO: Diseñen una ciudad sostenible asignando roles específicos"`
      }

      console.log(`Intentando generar pregunta para arquetipo ${arquetipo} en ${materia}`)

      const { object: pregunta } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: PreguntaSchema,
        prompt: prompt,
        temperature: 0.8,
      })

      console.log("Pregunta generada exitosamente con OpenAI")

      return NextResponse.json({
        success: true,
        id: Math.floor(Math.random() * 10000),
        materia,
        arquetipo,
        tema,
        ...pregunta,
        generadoPorIA: true,
        fechaGeneracion: new Date().toISOString(),
      })
    } catch (aiError: any) {
      console.error("Error específico de OpenAI:", aiError.message)

      // Manejar errores específicos y usar fallback inteligente
      let errorType = "api_error"

      if (
        aiError.message?.includes("quota") ||
        aiError.message?.includes("billing") ||
        aiError.message?.includes("exceeded")
      ) {
        console.log("Cuota de OpenAI excedida, usando generación simulada inteligente")
        errorType = "quota_exceeded"
      } else if (aiError.message?.includes("rate limit")) {
        console.log("Rate limit de OpenAI alcanzado, usando generación simulada")
        errorType = "rate_limit"
      } else if (aiError.message?.includes("API key") || aiError.message?.includes("authentication")) {
        console.log("Error de API key de OpenAI, usando generación simulada")
        errorType = "api_key_error"
      } else {
        console.log("Error general de OpenAI, usando generación simulada")
        errorType = "api_error"
      }

      return generarPreguntaSimulada(arquetipo, materia, tema, dificultad, errorType)
    }
  } catch (error) {
    console.error("Error general obteniendo minijuego:", error)
    return generarPreguntaSimulada("gamer", "Matemáticas", "", "medio")
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
