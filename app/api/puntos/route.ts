import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { puntos, tipo, descripcion } = await request.json()

    // Simular actualización de puntos en base de datos
    const transaccion = {
      id: Math.random().toString(36).substr(2, 9),
      puntos,
      tipo,
      descripcion: descripcion || `Puntos por ${tipo}`,
      fecha: new Date().toISOString(),
      usuario: "demo_user",
    }

    // Simular respuesta exitosa
    return NextResponse.json({
      success: true,
      transaccion,
      puntosActualizados: true,
      message: `${puntos > 0 ? "Ganaste" : "Gastaste"} ${Math.abs(puntos)} puntos`,
    })
  } catch (error) {
    console.error("Error actualizando puntos:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar puntos" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Simular historial de puntos
    const historial = [
      {
        id: "1",
        puntos: 25,
        tipo: "respuesta_correcta",
        descripcion: "Respuesta correcta en trivia",
        fecha: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "2",
        puntos: -50,
        tipo: "votacion",
        descripcion: "Voto en propuesta estudiantil",
        fecha: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "3",
        puntos: 100,
        tipo: "minijuego_completado",
        descripcion: "Completó minijuego de matemáticas",
        fecha: new Date(Date.now() - 259200000).toISOString(),
      },
    ]

    return NextResponse.json({
      success: true,
      historial,
      totalPuntos: 1250,
    })
  } catch (error) {
    console.error("Error obteniendo historial:", error)
    return NextResponse.json({ success: false, error: "Error al obtener historial" }, { status: 500 })
  }
}
