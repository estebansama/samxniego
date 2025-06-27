import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    // Simular propuestas de votación
    const propuestas = [
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
        yaVote: false,
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
        yaVote: true,
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
        yaVote: true,
      },
    ]

    return NextResponse.json({
      success: true,
      propuestas,
      totalPropuestas: propuestas.length,
    })
  } catch (error) {
    console.error("Error obteniendo propuestas:", error)
    return NextResponse.json({ success: false, error: "Error al obtener propuestas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.accion === "votar") {
      // Simular voto
      const { propuestaId, costoPuntos } = body

      return NextResponse.json({
        success: true,
        message: "Voto registrado exitosamente",
        propuestaId,
        puntosDescontados: costoPuntos,
      })
    } else {
      // Crear nueva propuesta
      const { titulo, descripcion, autor, costoPuntos } = body

      const nuevaPropuesta = {
        id: Math.random().toString(36).substr(2, 9),
        titulo,
        descripcion,
        autor,
        votos: 0,
        totalVotos: 120,
        costoPuntos: costoPuntos || 100,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString().split("T")[0],
        yaVote: false,
      }

      return NextResponse.json({
        success: true,
        propuesta: nuevaPropuesta,
        message: "Propuesta creada exitosamente",
      })
    }
  } catch (error) {
    console.error("Error en votación:", error)
    return NextResponse.json({ success: false, error: "Error al procesar votación" }, { status: 500 })
  }
}
