import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const materia = searchParams.get("materia")
    const tipo = searchParams.get("tipo")

    // Simular minijuegos disponibles
    let minijuegos = [
      {
        id: "1",
        titulo: "Trivia de Historia",
        descripcion: "Preguntas sobre historia mundial",
        tipo: "trivia",
        materia: "Historia",
        dificultad: "Medio",
        puntos: 50,
        tiempoEstimado: "10 min",
        disponible: true,
      },
      {
        id: "2",
        titulo: "Memoria Matemática",
        descripcion: "Ejercicios de memoria con números",
        tipo: "memoria",
        materia: "Matemáticas",
        dificultad: "Fácil",
        puntos: 75,
        tiempoEstimado: "8 min",
        disponible: true,
      },
      {
        id: "3",
        titulo: "Análisis Literario",
        descripcion: "Comprensión de textos literarios",
        tipo: "analisis",
        materia: "Literatura",
        dificultad: "Difícil",
        puntos: 100,
        tiempoEstimado: "15 min",
        disponible: true,
      },
      {
        id: "4",
        titulo: "Experimentos Virtuales",
        descripcion: "Simulaciones de laboratorio",
        tipo: "simulacion",
        materia: "Ciencias",
        dificultad: "Medio",
        puntos: 80,
        tiempoEstimado: "12 min",
        disponible: true,
      },
    ]

    // Filtrar por materia si se especifica
    if (materia) {
      minijuegos = minijuegos.filter((juego) => juego.materia === materia)
    }

    // Filtrar por tipo si se especifica
    if (tipo) {
      minijuegos = minijuegos.filter((juego) => juego.tipo === tipo)
    }

    return NextResponse.json({
      success: true,
      minijuegos,
      total: minijuegos.length,
    })
  } catch (error) {
    console.error("Error obteniendo minijuegos:", error)
    return NextResponse.json({ success: false, error: "Error al obtener minijuegos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const minijuegoData = await request.json()

    // Simular creación de minijuego
    const nuevoMinijuego = {
      id: Math.random().toString(36).substr(2, 9),
      ...minijuegoData,
      fechaCreacion: new Date().toISOString(),
      activo: true,
    }

    return NextResponse.json({
      success: true,
      minijuego: nuevoMinijuego,
      message: "Minijuego creado exitosamente",
    })
  } catch (error) {
    console.error("Error creando minijuego:", error)
    return NextResponse.json({ success: false, error: "Error al crear minijuego" }, { status: 500 })
  }
}
