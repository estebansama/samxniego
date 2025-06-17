import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")
    const alumnoId = searchParams.get("alumno") || "2"

    // Simular datos del informe semanal
    const informeSimulado = {
      alumno: "Juan Estudiante",
      curso: "3°A",
      periodo: "Semana del 15-19 Enero 2024",
      resumen: {
        atencionPromedio: 88,
        participacionPromedio: 85,
        puntosGanados: 1250,
        mejoraSemanal: 12,
        diasAsistencia: 5,
        totalDias: 5,
      },
      materias: [
        {
          nombre: "Matemáticas",
          atencion: 92,
          participacion: 88,
          progreso: 85,
          actividades: 8,
          puntosGanados: 320,
          observaciones: "Excelente comprensión de álgebra básica",
        },
        {
          nombre: "Historia",
          atencion: 78,
          participacion: 85,
          progreso: 78,
          actividades: 5,
          puntosGanados: 280,
          observaciones: "Necesita reforzar temas de historia contemporánea",
        },
        {
          nombre: "Literatura",
          atencion: 95,
          participacion: 90,
          progreso: 92,
          actividades: 6,
          puntosGanados: 350,
          observaciones: "Demuestra gran creatividad en análisis literario",
        },
        {
          nombre: "Ciencias",
          atencion: 85,
          participacion: 78,
          progreso: 88,
          actividades: 7,
          puntosGanados: 300,
          observaciones: "Buen desempeño en experimentos prácticos",
        },
      ],
      actividadesRecientes: [
        {
          fecha: "2024-01-19",
          actividad: "Completó trivia de Historia",
          puntos: 75,
          atencion: 85,
          tiempo: "10 minutos",
        },
        {
          fecha: "2024-01-19",
          actividad: "Participó en pausa activa",
          puntos: 25,
          atencion: 90,
          tiempo: "5 minutos",
        },
        {
          fecha: "2024-01-18",
          actividad: "Resolvió ejercicios de Matemáticas",
          puntos: 100,
          atencion: 95,
          tiempo: "15 minutos",
        },
        {
          fecha: "2024-01-18",
          actividad: "Votó en propuesta estudiantil",
          puntos: 10,
          atencion: 80,
          tiempo: "2 minutos",
        },
        {
          fecha: "2024-01-17",
          actividad: "Completó juego de memoria - Literatura",
          puntos: 85,
          atencion: 92,
          tiempo: "12 minutos",
        },
      ],
      logros: [
        {
          nombre: "Racha de 5",
          descripcion: "Respondió 5 preguntas seguidas correctamente",
          fecha: "2024-01-18",
          puntos: 50,
        },
        {
          nombre: "Participación Activa",
          descripcion: "Participó en todas las clases de la semana",
          fecha: "2024-01-19",
          puntos: 100,
        },
      ],
      recomendaciones: [
        {
          tipo: "refuerzo",
          materia: "Historia",
          descripcion: "Se recomienda dedicar más tiempo a los temas de historia contemporánea",
          prioridad: "media",
        },
        {
          tipo: "fortaleza",
          materia: "Literatura",
          descripcion: "Excelente comprensión y análisis literario. Continuar fomentando la creatividad",
          prioridad: "baja",
        },
        {
          tipo: "general",
          materia: "Todas",
          descripcion: "Mantiene un nivel alto de participación. Seguir motivando la participación activa",
          prioridad: "baja",
        },
      ],
      tendencias: {
        atencionSemanal: [
          { dia: "Lunes", valor: 85 },
          { dia: "Martes", valor: 88 },
          { dia: "Miércoles", valor: 92 },
          { dia: "Jueves", valor: 87 },
          { dia: "Viernes", valor: 90 },
        ],
        participacionSemanal: [
          { dia: "Lunes", valor: 78 },
          { dia: "Martes", valor: 82 },
          { dia: "Miércoles", valor: 85 },
          { dia: "Jueves", valor: 90 },
          { dia: "Viernes", valor: 88 },
        ],
      },
      comparativaGrupo: {
        atencionPromedio: 82,
        participacionPromedio: 79,
        puntosPromedio: 1050,
        posicionRelativa: "Por encima del promedio",
      },
    }

    return NextResponse.json({
      success: true,
      informe: informeSimulado,
      fechaGeneracion: new Date().toISOString(),
      proximaActualizacion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error("Error generando informe:", error)
    return NextResponse.json({ success: false, error: "Error generando informe" }, { status: 500 })
  }
}
