import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Schema para la respuesta estructurada del minijuego
const MinijuegoSchema = z.object({
  titulo: z.string().describe("Título atractivo del minijuego"),
  descripcion: z.string().describe("Descripción breve del minijuego"),
  tipo: z
    .enum(["trivia", "memoria", "verdadero_falso", "completar", "ordenar", "debate", "equipo"])
    .describe("Tipo de minijuego"),
  dificultad: z.enum(["Fácil", "Medio", "Difícil"]).describe("Nivel de dificultad"),
  preguntas: z
    .array(
      z.object({
        pregunta: z.string().describe("La pregunta, tema de debate o desafío de equipo"),
        opciones: z.array(z.string()).describe("Opciones de respuesta, argumentos base o tareas del equipo").optional(),
        respuestaCorrecta: z.string().describe("La respuesta correcta o resultado esperado").optional(),
        explicacion: z.string().describe("Explicación educativa o reflexión del proceso").optional(),
        puntaje: z.number().describe("Puntos que otorga esta actividad"),
        tipoActividad: z
          .enum(["pregunta", "debate", "colaboracion"])
          .describe("Tipo específico de actividad")
          .optional(),
        argumentos: z.array(z.string()).describe("Argumentos base para debates").optional(),
        tareas: z.array(z.string()).describe("Tareas específicas para trabajo en equipo").optional(),
        equiposRequeridos: z.number().describe("Número de equipos necesarios").optional(),
      }),
    )
    .describe("Array de actividades del minijuego"),
  tiempoEstimado: z.string().describe("Tiempo estimado para completar"),
  arquetipos: z.array(z.string()).describe("Arquetipos de estudiantes para los que es adecuado"),
  objetivosAprendizaje: z.array(z.string()).describe("Objetivos de aprendizaje que cumple"),
  modalidadColaborativa: z.boolean().describe("Si requiere colaboración entre estudiantes").optional(),
  habilidadesSociales: z.array(z.string()).describe("Habilidades sociales que desarrolla").optional(),
})

export async function POST(request: NextRequest) {
  try {
    const { contenido, tipo, materia = "General", nivel = "Secundario", proveedor = "auto" } = await request.json()

    if (!contenido) {
      return NextResponse.json({ success: false, error: "Contenido es requerido" }, { status: 400 })
    }

    // Determinar qué proveedor de IA usar
    const { model, proveedorUsado } = seleccionarProveedorIA(proveedor)

    if (!model) {
      console.log("No hay proveedores de IA disponibles, usando generación simulada inteligente")
      return generarMinijuegoSimulado(contenido, tipo, materia)
    }

    try {
      // Crear prompt adaptado según el tipo de contenido
      const prompts = {
        texto: `Analiza el siguiente contenido educativo y crea un minijuego interactivo para estudiantes de ${nivel}:

CONTENIDO:
${contenido}

INSTRUCCIONES:
- Crea preguntas que evalúen comprensión, no memorización
- Adapta el lenguaje para estudiantes de secundaria
- Incluye explicaciones educativas claras y concisas
- Varía los tipos de preguntas para mantener el interés
- Asegúrate de que sea desafiante pero alcanzable
- Genera entre 3-5 preguntas de calidad
- Cada pregunta debe tener 4 opciones de respuesta
- Incluye puntajes apropiados (15-35 puntos por pregunta)`,

        imagen: `Basándote en una imagen educativa subida por el docente, crea un minijuego visual para estudiantes de ${nivel}.

CONTEXTO DE LA IMAGEN:
${contenido}

INSTRUCCIONES:
- Crea preguntas sobre elementos visuales específicos
- Incluye preguntas de observación detallada y análisis
- Fomenta el pensamiento crítico visual
- Adapta para diferentes estilos de aprendizaje
- Genera preguntas que requieran interpretación de la imagen`,

        archivo: `Basándote en el contenido de un documento educativo, crea un minijuego para estudiantes de ${nivel}:

RESUMEN DEL DOCUMENTO:
${contenido}

INSTRUCCIONES:
- Extrae los conceptos clave más importantes del documento
- Crea preguntas de diferentes niveles cognitivos (comprensión, aplicación, análisis)
- Incluye preguntas de aplicación práctica
- Asegúrate de cubrir los puntos principales del documento
- Enfócate en la comprensión profunda, no en detalles menores`,

        link: `Basándote en el contenido de un recurso web educativo, crea un minijuego para estudiantes de ${nivel}:

CONTENIDO DEL RECURSO:
${contenido}

INSTRUCCIONES:
- Identifica los conceptos más importantes y relevantes
- Crea preguntas que conecten con conocimientos previos
- Incluye preguntas de análisis y síntesis
- Fomenta la aplicación del conocimiento en contextos reales
- Evalúa la credibilidad y relevancia de la información`,
      }

      let prompt = prompts[tipo as keyof typeof prompts] || prompts.texto

      if (tipo === "debate") {
        prompt += `

FORMATO ESPECIAL PARA DEBATE:
- Crea un tema controvertial pero educativo apropiado para secundaria
- Proporciona 2-3 argumentos base para cada posición (a favor y en contra)
- Asegúrate de que el tema permita múltiples perspectivas válidas
- Incluye reflexiones que fomenten el pensamiento crítico
- Evita temas demasiado polarizantes o inapropiados para la edad
- Ejemplo: "¿Deberían los estudiantes poder usar dispositivos móviles en clase?"`
      }

      if (tipo === "equipo") {
        prompt += `

FORMATO ESPECIAL PARA TRABAJO EN EQUIPO:
- Diseña un desafío que requiera múltiples habilidades y perspectivas
- Divide el trabajo en 3-4 tareas específicas y complementarias
- Asegúrate de que cada tarea sea esencial para el resultado final
- Incluye objetivos que fomenten la comunicación y coordinación
- Proporciona criterios claros para evaluar el éxito grupal
- Ejemplo: "Diseñen una campaña de concientización ambiental para su escuela"`
      }

      console.log(`Generando minijuego con ${proveedorUsado}...`)

      const { object: minijuego } = await generateObject({
        model: model,
        schema: MinijuegoSchema,
        prompt: prompt,
        temperature: 0.7,
      })

      console.log(`Minijuego generado exitosamente con ${proveedorUsado}`)

      return NextResponse.json({
        success: true,
        minijuego: {
          ...minijuego,
          contenidoOriginal: contenido.substring(0, 200) + "...",
          fechaCreacion: new Date().toISOString(),
          estado: "listo",
          generadoPorIA: true,
          proveedorIA: proveedorUsado,
          materia,
          nivel,
        },
        message: `Minijuego generado con ${proveedorUsado} exitosamente`,
      })
    } catch (aiError: any) {
      console.error(`Error específico de IA (${proveedorUsado}):`, aiError.message)

      // Manejar errores específicos de IA
      if (aiError.message?.includes("quota") || aiError.message?.includes("billing")) {
        console.log(`Cuota de ${proveedorUsado} excedida, usando generación simulada inteligente`)
        return generarMinijuegoSimulado(contenido, tipo, materia, "quota_exceeded")
      } else if (aiError.message?.includes("rate limit")) {
        console.log(`Rate limit de ${proveedorUsado} alcanzado, usando generación simulada`)
        return generarMinijuegoSimulado(contenido, tipo, materia, "rate_limit")
      } else if (aiError.message?.includes("API key")) {
        console.log(`Error de API key de ${proveedorUsado}, usando generación simulada`)
        return generarMinijuegoSimulado(contenido, tipo, materia, "api_key_error")
      } else {
        console.log(`Error general de ${proveedorUsado}, usando generación simulada`)
        return generarMinijuegoSimulado(contenido, tipo, materia, "api_error")
      }
    }
  } catch (error) {
    console.error("Error general generando minijuego:", error)
    return generarMinijuegoSimulado("", "texto", "General", "general_error")
  }
}

// Función para seleccionar el proveedor de IA disponible
function seleccionarProveedorIA(preferencia = "auto") {
  const geminiKey = process.env.API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  console.log("Verificando proveedores de IA disponibles...")
  console.log("Gemini API Key disponible:", !!geminiKey)
  console.log("OpenAI API Key disponible:", !!openaiKey)

  // Si se especifica una preferencia y está disponible
  if (preferencia === "gemini" && geminiKey) {
    try {
      const google = createGoogleGenerativeAI({
        apiKey: geminiKey,
      })
      return {
        model: google("gemini-1.5-flash"),
        proveedorUsado: "Gemini",
      }
    } catch (error) {
      console.error("Error configurando Gemini:", error)
    }
  }

  if (preferencia === "openai" && openaiKey) {
    return {
      model: openai("gpt-4o-mini"),
      proveedorUsado: "OpenAI",
    }
  }

  // Selección automática: priorizar Gemini si está disponible
  if (geminiKey) {
    try {
      const google = createGoogleGenerativeAI({
        apiKey: geminiKey,
      })
      return {
        model: google("gemini-1.5-flash"),
        proveedorUsado: "Gemini",
      }
    } catch (error) {
      console.error("Error configurando Gemini, intentando con OpenAI:", error)
    }
  }

  if (openaiKey) {
    return {
      model: openai("gpt-4o-mini"),
      proveedorUsado: "OpenAI",
    }
  }

  // No hay proveedores disponibles
  return {
    model: null,
    proveedorUsado: "Ninguno",
  }
}

// Función mejorada para generar minijuegos simulados más inteligentes
function generarMinijuegoSimulado(contenido: string, tipo: string, materia: string, errorType?: string) {
  // Analizar el contenido para crear preguntas más relevantes
  const palabrasClave = extraerPalabrasClave(contenido)
  const temaDetectado = detectarTema(contenido, materia)

  const minijuegosInteligentes = {
    texto: {
      titulo: `Trivia Interactiva: ${temaDetectado}`,
      descripcion: `Preguntas de comprensión basadas en el contenido de ${materia}`,
      tipo: "trivia" as const,
      dificultad: "Medio" as const,
      preguntas: generarPreguntasInteligentes(contenido, palabrasClave, materia),
      tiempoEstimado: "8-10 minutos",
      arquetipos: ["analítico", "gamer"],
      objetivosAprendizaje: [
        "Comprensión conceptual del tema",
        "Aplicación práctica de conocimientos",
        "Análisis crítico de información",
      ],
    },
    imagen: {
      titulo: `Análisis Visual: ${temaDetectado}`,
      descripcion: "Juego de observación y análisis de elementos visuales educativos",
      tipo: "memoria" as const,
      dificultad: "Fácil" as const,
      preguntas: [
        {
          pregunta: `¿Qué elementos principales relacionados con ${materia} puedes identificar?`,
          opciones: [
            `Elementos conceptuales de ${temaDetectado}`,
            "Elementos decorativos únicamente",
            "Información no relacionada",
            "Datos irrelevantes",
          ],
          respuestaCorrecta: `Elementos conceptuales de ${temaDetectado}`,
          explicacion: `La imagen contiene elementos educativos importantes relacionados con ${materia} que ayudan a comprender ${temaDetectado}.`,
          puntaje: 25,
        },
        {
          pregunta: `¿Cómo se relaciona esta imagen con los conceptos de ${materia}?`,
          opciones: [
            "Proporciona ejemplos visuales concretos",
            "No tiene relación educativa",
            "Solo tiene valor estético",
            "Es información contradictoria",
          ],
          respuestaCorrecta: "Proporciona ejemplos visuales concretos",
          explicacion:
            "Las imágenes educativas sirven para concretizar conceptos abstractos y facilitar la comprensión.",
          puntaje: 30,
        },
      ],
      tiempoEstimado: "5-7 minutos",
      arquetipos: ["visual", "creativo"],
      objetivosAprendizaje: [
        "Observación detallada y sistemática",
        "Análisis visual de información",
        "Conexión entre imagen y concepto",
      ],
    },
    archivo: {
      titulo: `Comprensión Documental: ${temaDetectado}`,
      descripcion: "Análisis y comprensión de documento educativo",
      tipo: "completar" as const,
      dificultad: "Medio" as const,
      preguntas: generarPreguntasDocumento(contenido, materia, temaDetectado),
      tiempoEstimado: "10-12 minutos",
      arquetipos: ["analítico", "lector"],
      objetivosAprendizaje: [
        "Comprensión lectora avanzada",
        "Extracción de ideas principales",
        "Síntesis de información",
      ],
    },
    link: {
      titulo: `Exploración Web: ${temaDetectado}`,
      descripcion: "Análisis de recurso digital educativo",
      tipo: "verdadero_falso" as const,
      dificultad: "Fácil" as const,
      preguntas: generarPreguntasWeb(contenido, materia, temaDetectado),
      tiempoEstimado: "6-8 minutos",
      arquetipos: ["digital", "explorador"],
      objetivosAprendizaje: [
        "Evaluación de fuentes digitales",
        "Comprensión de contenido web",
        "Pensamiento crítico digital",
      ],
    },
    debate: {
      titulo: `Debate Educativo: ${temaDetectado}`,
      descripcion: `Sesión de debate estructurado sobre ${materia} con argumentación crítica`,
      tipo: "debate" as const,
      dificultad: "Medio" as const,
      preguntas: [
        {
          pregunta: `¿La tecnología mejora o perjudica el aprendizaje en ${materia}?`,
          tipoActividad: "debate" as const,
          argumentos: [
            `A favor: La tecnología hace ${materia} más accesible e interactiva`,
            `En contra: La tecnología puede distraer del aprendizaje profundo en ${materia}`,
            "Punto neutral: El impacto depende de cómo se implemente",
          ],
          explicacion: `Este debate fomenta la reflexión crítica sobre el papel de la tecnología en la educación de ${materia}`,
          puntaje: 50,
        },
      ],
      tiempoEstimado: "15-20 minutos",
      arquetipos: ["debatidor", "analítico"],
      objetivosAprendizaje: [
        "Desarrollar habilidades de argumentación",
        "Fomentar el pensamiento crítico",
        "Practicar la escucha activa y el respeto por opiniones diversas",
      ],
      modalidadColaborativa: true,
      habilidadesSociales: ["argumentación", "escucha activa", "respeto por la diversidad de opiniones"],
    },

    equipo: {
      titulo: `Proyecto Colaborativo: ${temaDetectado}`,
      descripcion: `Desafío de equipo que requiere colaboración y resolución conjunta de problemas en ${materia}`,
      tipo: "equipo" as const,
      dificultad: "Medio" as const,
      preguntas: [
        {
          pregunta: `Trabajen en equipo para crear una solución innovadora relacionada con ${materia}`,
          tipoActividad: "colaboracion" as const,
          tareas: [
            `Investigador: Analizar conceptos clave de ${materia}`,
            "Diseñador: Crear la estructura de la solución",
            "Evaluador: Analizar viabilidad y efectividad",
            "Comunicador: Preparar presentación final",
          ],
          equiposRequeridos: 3,
          explicacion: `Este proyecto desarrolla habilidades colaborativas mientras se aplican conocimientos de ${materia}`,
          puntaje: 75,
        },
      ],
      tiempoEstimado: "20-25 minutos",
      arquetipos: ["colaborativo", "social"],
      objetivosAprendizaje: [
        "Desarrollar habilidades de trabajo en equipo",
        "Aplicar conocimientos en proyectos prácticos",
        "Fomentar la comunicación efectiva",
      ],
      modalidadColaborativa: true,
      habilidadesSociales: ["trabajo en equipo", "comunicación", "liderazgo compartido", "coordinación"],
    },
  }

  const minijuegoBase =
    minijuegosInteligentes[tipo as keyof typeof minijuegosInteligentes] || minijuegosInteligentes.texto

  // Mensaje personalizado según el tipo de error
  const mensajes = {
    quota_exceeded: "Generado con simulador inteligente - Cuota de IA temporalmente excedida",
    rate_limit: "Generado con simulador inteligente - Límite de velocidad de IA alcanzado",
    api_key_error: "Generado con simulador inteligente - Error de configuración de API key",
    api_error: "Generado con simulador inteligente - Error temporal de IA",
    general_error: "Generado con simulador inteligente - Modo offline",
    default: "Generado con simulador inteligente - Configura API_KEY para IA real",
  }

  return NextResponse.json({
    success: true,
    minijuego: {
      ...minijuegoBase,
      contenidoOriginal: contenido.substring(0, 200) + "...",
      fechaCreacion: new Date().toISOString(),
      estado: "listo",
      generadoPorIA: false,
      proveedorIA: "Simulador",
      materia,
      nivel: "Secundario",
      nota: mensajes[errorType as keyof typeof mensajes] || mensajes.default,
      simuladorInteligente: true,
    },
    message: "Minijuego generado con simulador inteligente",
  })
}

// Función para extraer palabras clave del contenido
function extraerPalabrasClave(contenido: string): string[] {
  if (!contenido) return []

  const palabrasComunes = [
    "el",
    "la",
    "de",
    "que",
    "y",
    "a",
    "en",
    "un",
    "es",
    "se",
    "no",
    "te",
    "lo",
    "le",
    "da",
    "su",
    "por",
    "son",
    "con",
    "para",
    "al",
    "del",
    "los",
    "las",
    "una",
    "como",
    "pero",
    "sus",
    "han",
    "fue",
    "ser",
    "está",
    "todo",
    "más",
    "muy",
    "era",
    "hasta",
    "desde",
    "está",
    "estaba",
    "estamos",
  ]

  const palabras = contenido
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((palabra) => palabra.length > 3 && !palabrasComunes.includes(palabra))
    .slice(0, 10)

  return [...new Set(palabras)]
}

// Función para detectar el tema principal
function detectarTema(contenido: string, materia: string): string {
  if (!contenido) return materia

  const temas = {
    Matemáticas: ["ecuación", "función", "álgebra", "geometría", "cálculo", "número", "fórmula"],
    Historia: ["guerra", "revolución", "siglo", "época", "imperio", "independencia", "gobierno"],
    Literatura: ["novela", "poema", "autor", "narrativa", "personaje", "estilo", "género"],
    Ciencias: ["experimento", "hipótesis", "célula", "átomo", "energía", "reacción", "organismo"],
    Física: ["fuerza", "velocidad", "energía", "movimiento", "onda", "partícula", "campo"],
    Química: ["elemento", "compuesto", "reacción", "molécula", "átomo", "enlace", "solución"],
  }

  const contenidoLower = contenido.toLowerCase()

  for (const [tema, palabrasClave] of Object.entries(temas)) {
    const coincidencias = palabrasClave.filter((palabra) => contenidoLower.includes(palabra))
    if (coincidencias.length > 0) {
      return tema
    }
  }

  return materia
}

// Función para generar preguntas inteligentes basadas en contenido
function generarPreguntasInteligentes(contenido: string, palabrasClave: string[], materia: string) {
  const preguntasBase = [
    {
      pregunta: `Según el contenido analizado, ¿cuál es el concepto principal relacionado con ${materia}?`,
      opciones: [
        `El tema central del contenido de ${materia}`,
        "Un concepto secundario mencionado",
        "Una idea no relacionada con la materia",
        "Información complementaria únicamente",
      ],
      respuestaCorrecta: `El tema central del contenido de ${materia}`,
      explicacion: `El contenido se enfoca en conceptos fundamentales de ${materia} que son esenciales para la comprensión del tema.`,
      puntaje: 25,
    },
    {
      pregunta:
        palabrasClave.length > 0
          ? `¿Cómo se relacionan los conceptos "${palabrasClave[0]}" y "${palabrasClave[1] || "educación"}" en este contexto?`
          : `¿Cuál es la aplicación práctica de este conocimiento de ${materia}?`,
      opciones: [
        "Están directamente relacionados y se complementan",
        "Son conceptos completamente independientes",
        "Solo uno de ellos es relevante",
        "No tienen relación con el tema principal",
      ],
      respuestaCorrecta: "Están directamente relacionados y se complementan",
      explicacion:
        "En el contexto educativo, los conceptos se interrelacionan para formar una comprensión integral del tema.",
      puntaje: 30,
    },
  ]

  return preguntasBase
}

// Función para generar preguntas de documento
function generarPreguntasDocumento(contenido: string, materia: string, tema: string) {
  return [
    {
      pregunta: `Completa la siguiente afirmación sobre ${tema}: "El documento establece que..."`,
      opciones: [
        `Los conceptos de ${materia} son fundamentales para comprender ${tema}`,
        "La información presentada es opcional",
        "No hay conexión entre los conceptos",
        "El tema no requiere estudio profundo",
      ],
      respuestaCorrecta: `Los conceptos de ${materia} son fundamentales para comprender ${tema}`,
      explicacion: `El documento educativo enfatiza la importancia de dominar los conceptos básicos de ${materia}.`,
      puntaje: 35,
    },
  ]
}

// Función para generar preguntas de contenido web
function generarPreguntasWeb(contenido: string, materia: string, tema: string) {
  return [
    {
      pregunta: `Verdadero o Falso: El recurso web proporciona información actualizada sobre ${tema}`,
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: "Verdadero",
      explicacion: `Los recursos web educativos suelen contener información actualizada y relevante sobre ${materia}.`,
      puntaje: 20,
    },
    {
      pregunta: `Verdadero o Falso: La información del enlace es suficiente para comprender completamente ${tema}`,
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: "Falso",
      explicacion:
        "Un solo recurso web generalmente proporciona una perspectiva parcial; se recomienda consultar múltiples fuentes.",
      puntaje: 25,
    },
  ]
}
