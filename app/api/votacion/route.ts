import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos en memoria
const propuestas: Array<{
  id: number
  titulo: string
  descripcion: string
  autor: string
  votos: number
  totalVotos: number
  costoPuntos: number
  estado: "activa" | "aprobada" | "rechazada"
  fechaCreacion: string
  votantes: string[]
}> = [
  {
    id: 1,
    titulo: "Recreos más largos",
    descripcion: "Propongo que los recreos duren 20 minutos en lugar de 15",
    autor: "Ana García",
    votos: 45,
    totalVotos: 120,
    costoPuntos: 50,
    estado: "activa",
    fechaCreacion: "2024-01-15",
    votantes: [],
  },
  {
    id: 2,
    titulo: "Clases de programación",
    descripcion: "Incluir clases opcionales de programación y desarrollo web",
    autor: "Carlos López",
    votos: 78,
    totalVotos: 120,
    costoPuntos: 75,
    estado: "activa",
    fechaCreacion: "2024-01-14",
    votantes: ["default_user"],
  },
  {
    id: 3,
    titulo: "Cafetería saludable",
    descripcion: "Más opciones de comida saludable en la cafetería escolar",
    autor: "María Rodríguez",
    votos: 92,
    totalVotos: 120,
    costoPuntos: 60,
    estado: "aprobada",
    fechaCreacion: "2024-01-10",
    votantes: ["default_user"],
  },
]

let contadorId = 4

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario = searchParams.get("usuario") || "default_user"

    // Marcar propuestas donde el usuario ya votó
    const propuestasConEstado = propuestas.map((propuesta) => ({
      ...propuesta,
      yaVote: propuesta.votantes.includes(usuario),
    }))

    return NextResponse.json({
      success: true,
      propuestas: propuestasConEstado,
      estadisticas: {
        totalPropuestas: propuestas.length,
        propuestasActivas: propuestas.filter((p) => p.estado === "activa").length,
        propuestasAprobadas: propuestas.filter((p) => p.estado === "aprobada").length,
        participacionPromedio: Math.round(
          (propuestas.reduce((acc, p) => acc + p.votos / p.totalVotos, 0) / propuestas.length) * 100,
        ),
      },
    })
  } catch (error) {
    console.error("Error obteniendo propuestas:", error)
    return NextResponse.json({ success: false, error: "Error obteniendo propuestas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const usuario = body.usuario || "default_user"

    if (body.accion === "votar") {
      const { propuestaId, costoPuntos } = body

      const propuesta = propuestas.find((p) => p.id === propuestaId)
      if (!propuesta) {
        return NextResponse.json({ success: false, error: "Propuesta no encontrada" }, { status: 404 })
      }

      if (propuesta.votantes.includes(usuario)) {
        return NextResponse.json({ success: false, error: "Ya has votado en esta propuesta" }, { status: 400 })
      }

      // Actualizar voto
      propuesta.votos += 1
      propuesta.votantes.push(usuario)

      // Verificar si la propuesta debe ser aprobada (más del 75% de votos)
      if (propuesta.votos / propuesta.totalVotos > 0.75) {
        propuesta.estado = "aprobada"
      }

      return NextResponse.json({
        success: true,
        message: "Voto registrado exitosamente",
        propuesta: {
          ...propuesta,
          yaVote: true,
        },
      })
    } else {
      // Crear nueva propuesta
      const { titulo, descripcion, autor, costoPuntos = 100 } = body

      if (!titulo || !descripcion || !autor) {
        return NextResponse.json(
          { success: false, error: "Título, descripción y autor son requeridos" },
          { status: 400 },
        )
      }

      const nuevaPropuesta = {
        id: contadorId++,
        titulo,
        descripcion,
        autor,
        votos: 0,
        totalVotos: 120, // Simulado
        costoPuntos,
        estado: "activa" as const,
        fechaCreacion: new Date().toISOString().split("T")[0],
        votantes: [],
      }

      propuestas.push(nuevaPropuesta)

      return NextResponse.json({
        success: true,
        message: "Propuesta creada exitosamente",
        propuesta: nuevaPropuesta,
      })
    }
  } catch (error) {
    console.error("Error en votación:", error)
    return NextResponse.json({ success: false, error: "Error procesando votación" }, { status: 500 })
  }
}
