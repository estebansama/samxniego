import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Simular datos de informe para padres
    const informe = {
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
        { nombre: "Matemáticas", progreso: 85, participacion: 90 },
        { nombre: "Historia", progreso: 78, participacion: 85 },
        { nombre: "Literatura", progreso: 92, participacion: 88 },
        { nombre: "Ciencias", progreso: 88, participacion: 82 },
      ],
      actividades: [
        { actividad: "Completó trivia de Historia", puntos: 75, tiempo: "Hace 2 horas" },
        { actividad: "Participó en pausa activa", puntos: 25, tiempo: "Hace 4 horas" },
        { actividad: "Resolvió ejercicios de Matemáticas", puntos: 100, tiempo: "Ayer" },
        { actividad: "Votó en propuesta estudiantil", puntos: 10, tiempo: "Hace 2 días" },
      ],
      recomendaciones: [
        {
          tipo: "refuerzo",
          materia: "Historia",
          descripcion: "Se recomienda dedicar más tiempo a los temas de historia contemporánea.",
        },
        {
          tipo: "fortaleza",
          materia: "Matemáticas",
          descripcion: "Demuestra comprensión sólida en resolución de problemas matemáticos.",
        },
      ],
      tendenciasSemanal: [
        { dia: "Lun", atencion: 85, participacion: 78 },
        { dia: "Mar", atencion: 88, participacion: 82 },
        { dia: "Mie", atencion: 92, participacion: 85 },
        { dia: "Jue", atencion: 87, participacion: 90 },
        { dia: "Vie", atencion: 90, participacion: 88 },
      ],
    }

    return NextResponse.json({
      success: true,
      informe,
      fechaGeneracion: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error generando informe:", error)
    return NextResponse.json({ success: false, error: "Error al generar informe" }, { status: 500 })
  }
}
