import { type NextRequest, NextResponse } from "next/server"
import { generateObject } from "ai"
import { openai } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

// Schema para generar informes personalizados
const InformeSchema = z.object({
  resumenEjecutivo: z.string().describe("Resumen ejecutivo del progreso del estudiante"),
  fortalezas: z.array(z.string()).describe("Principales fortalezas identificadas"),
  areasDeOportunidad: z.array(z.string()).describe("Áreas que necesitan atención"),
  recomendacionesEspecificas: z
    .array(
      z.object({
        area: z.string().describe("Área específica"),
        recomendacion: z.string().describe("Recomendación detallada"),
        accionesConcretas: z.array(z.string()).describe("Acciones específicas que pueden tomar los padres"),
      }),
    )
    .describe("Recomendaciones específicas con acciones"),
  tendenciasIdentificadas: z.array(z.string()).describe("Tendencias en el aprendizaje del estudiante"),
  prediccionesProgreso: z.string().describe("Predicción del progreso futuro basado en datos actuales"),
  sugerenciasMotivacion: z.array(z.string()).describe("Sugerencias para mantener la motivación del estudiante"),
})

export async function POST(request: NextRequest) {
  try {
    const {
      datosEstudiante,
      periodoAnalisis = "semanal",
      incluirPredicciones = true,
      proveedor = "auto",
    } = await request.json()

    if (!datosEstudiante) {
      return NextResponse.json({ success: false, error: "Datos del estudiante requeridos" }, { status: 400 })
    }

    // Determinar qué proveedor de IA usar
    const { model, proveedorUsado } = seleccionarProveedorIA(proveedor)

    if (!model) {
      console.warn("No hay proveedores de IA disponibles, generando informe simulado")
      return generarInformeSimulado(datosEstudiante)
    }

    const prompt = `Actúa como un experto en psicopedagogía y analiza los siguientes datos de un estudiante de secundaria para generar un informe comprensivo para sus padres:

DATOS DEL ESTUDIANTE:
${JSON.stringify(datosEstudiante, null, 2)}

PERÍODO DE ANÁLISIS: ${periodoAnalisis}

INSTRUCCIONES PARA EL ANÁLISIS:
1. Analiza patrones de aprendizaje y comportamiento de manera objetiva
2. Identifica fortalezas específicas y áreas de oportunidad concretas
3. Proporciona recomendaciones prácticas y accionables para los padres
4. Usa un lenguaje profesional pero accesible para padres de familia
5. Basa todas las conclusiones en los datos proporcionados
6. Incluye sugerencias específicas para el apoyo en casa
7. Considera el desarrollo integral del estudiante (académico, social, emocional)
8. Proporciona entre 3-5 fortalezas y 3-4 áreas de oportunidad
9. Incluye al menos 2 recomendaciones específicas con acciones concretas
10. Identifica 3-4 tendencias claras en el aprendizaje

ENFOQUE:
- Ser constructivo y positivo en el tono
- Ofrecer soluciones prácticas y realizables
- Reconocer logros y progreso específicos
- Proporcionar contexto educativo relevante
- Sugerir estrategias de apoyo familiar efectivas
- Mantener expectativas realistas pero motivadoras

FORMATO:
- Resumen ejecutivo: 2-3 párrafos concisos
- Fortalezas: Lista específica y detallada
- Áreas de oportunidad: Identificación clara sin ser negativa
- Recomendaciones: Prácticas y específicas con pasos concretos
- Tendencias: Patrones observables en el comportamiento de aprendizaje
- Predicciones: Basadas en datos, realistas y motivadoras
- Sugerencias de motivación: Estrategias específicas para mantener el interés`

    console.log(`Generando informe personalizado con ${proveedorUsado}...`)

    const { object: informe } = await generateObject({
      model: model,
      schema: InformeSchema,
      prompt: prompt,
      temperature: 0.3, // Menos creatividad, más precisión para informes
    })

    console.log(`Informe generado exitosamente con ${proveedorUsado}`)

    return NextResponse.json({
      success: true,
      informe: {
        ...informe,
        fechaGeneracion: new Date().toISOString(),
        periodoAnalisis,
        generadoPorIA: true,
        proveedorIA: proveedorUsado,
        estudiante: datosEstudiante.nombre || "Estudiante",
        metodologia: `Análisis con ${proveedorUsado} basado en datos de participación, rendimiento y comportamiento en Clasio`,
      },
      message: `Informe personalizado generado con ${proveedorUsado}`,
    })
  } catch (error) {
    console.error("Error generando informe con IA:", error)
    const datosEstudiante = await request.json()
    // Fallback a informe simulado
    return generarInformeSimulado(datosEstudiante)
  }
}

// Función para seleccionar el proveedor de IA disponible
function seleccionarProveedorIA(preferencia = "auto") {
  const geminiKey = process.env.API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  console.log("Verificando proveedores de IA disponibles para informes...")
  console.log("Gemini API Key disponible:", !!geminiKey)
  console.log("OpenAI API Key disponible:", !!openaiKey)

  // Si se especifica una preferencia y está disponible
  if (preferencia === "gemini" && geminiKey) {
    try {
      const google = createGoogleGenerativeAI({
        apiKey: geminiKey,
      })
      return {
        model: google("gemini-1.5-pro"),
        proveedorUsado: "Gemini",
      }
    } catch (error) {
      console.error("Error configurando Gemini:", error)
    }
  }

  if (preferencia === "openai" && openaiKey) {
    return {
      model: openai("gpt-4o"),
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
        model: google("gemini-1.5-pro"),
        proveedorUsado: "Gemini",
      }
    } catch (error) {
      console.error("Error configurando Gemini, intentando con OpenAI:", error)
    }
  }

  if (openaiKey) {
    return {
      model: openai("gpt-4o"),
      proveedorUsado: "OpenAI",
    }
  }

  // No hay proveedores disponibles
  return {
    model: null,
    proveedorUsado: "Ninguno",
  }
}

function generarInformeSimulado(datosEstudiante: any) {
  const informeSimulado = {
    resumenEjecutivo: `${datosEstudiante.nombre || "El estudiante"} muestra un progreso constante en su proceso de aprendizaje. Se observa una participación activa en las actividades digitales y una buena adaptación a las metodologías gamificadas. Su nivel de atención promedio del 88% indica un compromiso sólido con el proceso educativo.`,

    fortalezas: [
      "Excelente adaptación a herramientas tecnológicas educativas",
      "Participación consistente en actividades gamificadas",
      "Buen rendimiento en matemáticas y ciencias exactas",
      "Capacidad de mantener la atención durante períodos prolongados",
    ],

    areasDeOportunidad: [
      "Reforzar conceptos de historia contemporánea",
      "Mejorar la expresión escrita en literatura",
      "Desarrollar mayor confianza en presentaciones orales",
      "Optimizar técnicas de estudio para materias teóricas",
    ],

    recomendacionesEspecificas: [
      {
        area: "Historia",
        recomendacion:
          "Implementar técnicas de estudio visual y cronológico para mejorar la comprensión de eventos históricos",
        accionesConcretas: [
          "Crear líneas de tiempo visuales en casa",
          "Ver documentales históricos juntos",
          "Relacionar eventos históricos con situaciones actuales",
          "Usar mapas y recursos visuales para contextualizar",
        ],
      },
      {
        area: "Motivación",
        recomendacion: "Mantener el interés a través del reconocimiento de logros y establecimiento de metas claras",
        accionesConcretas: [
          "Celebrar los logros académicos, por pequeños que sean",
          "Establecer metas semanales alcanzables",
          "Crear un espacio de estudio cómodo y libre de distracciones",
          "Mantener comunicación regular con los docentes",
        ],
      },
    ],

    tendenciasIdentificadas: [
      "Mejor rendimiento en materias con componente práctico",
      "Mayor participación en horarios matutinos",
      "Preferencia por actividades colaborativas",
      "Respuesta positiva a sistemas de recompensas inmediatas",
    ],

    prediccionesProgreso:
      "Basándose en las tendencias actuales, se espera que el estudiante mantenga un crecimiento académico constante. Con el apoyo adecuado en las áreas identificadas, podría alcanzar un rendimiento superior en el próximo trimestre.",

    sugerenciasMotivacion: [
      "Reconocer y celebrar los pequeños logros diarios",
      "Conectar el aprendizaje con sus intereses personales",
      "Fomentar la autonomía en la organización del estudio",
      "Mantener expectativas realistas pero desafiantes",
      "Crear rutinas de estudio consistentes pero flexibles",
    ],
  }

  return NextResponse.json({
    success: true,
    informe: {
      ...informeSimulado,
      fechaGeneracion: new Date().toISOString(),
      periodoAnalisis: "semanal",
      generadoPorIA: false,
      proveedorIA: "Simulador",
      estudiante: datosEstudiante.nombre || "Estudiante",
      nota: "Informe simulado - Configura API_KEY para análisis con IA real",
    },
    message: "Informe generado (modo simulado)",
  })
}
