import { type NextRequest, NextResponse } from "next/server"

// Simulación de base de datos en memoria
const puntosUsuarios: { [key: string]: number } = {
  default_user: 1250,
}

let historialPuntos: Array<{
  usuario: string
  puntos: number
  tipo: string
  fecha: string
  descripcion: string
}> = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const usuario = searchParams.get("usuario") || "default_user"

    const puntosActuales = puntosUsuarios[usuario] || 0
    const historialUsuario = historialPuntos.filter((h) => h.usuario === usuario).slice(-10) // Últimos 10 movimientos

    return NextResponse.json({
      success: true,
      puntos: puntosActuales,
      historial: historialUsuario,
      nivel: Math.floor(puntosActuales / 200) + 1,
      puntosParaSiguienteNivel: 200 - (puntosActuales % 200),
    })
  } catch (error) {
    console.error("Error obteniendo puntos:", error)
    return NextResponse.json({ success: false, error: "Error obteniendo puntos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { puntos, tipo, usuario = "default_user", descripcion } = await request.json()

    if (!puntos || !tipo) {
      return NextResponse.json({ success: false, error: "Puntos y tipo son requeridos" }, { status: 400 })
    }

    // Actualizar puntos del usuario
    if (!puntosUsuarios[usuario]) {
      puntosUsuarios[usuario] = 0
    }

    puntosUsuarios[usuario] += puntos

    // Registrar en historial
    const tiposDescripcion = {
      respuesta_correcta: "Respuesta correcta en minijuego",
      participacion: "Participación en clase",
      pausa_activa: "Participación en pausa activa",
      creacion_propuesta: "Creación de propuesta estudiantil",
      voto: "Voto en propuesta estudiantil",
      logro: "Logro desbloqueado",
      bonus_diario: "Bonus por asistencia diaria",
    }

    historialPuntos.push({
      usuario,
      puntos,
      tipo,
      fecha: new Date().toISOString(),
      descripcion: descripcion || tiposDescripcion[tipo as keyof typeof tiposDescripcion] || "Actividad en Clasio",
    })

    // Mantener solo los últimos 100 registros por usuario
    historialPuntos = historialPuntos.slice(-100)

    const nuevosLogros = []
    const puntosActuales = puntosUsuarios[usuario]

    // Verificar logros automáticos
    if (puntosActuales >= 1000 && puntosActuales - puntos < 1000) {
      nuevosLogros.push({
        id: "mil_puntos",
        nombre: "Milésimo Punto",
        descripcion: "Alcanzaste 1000 puntos",
        puntos_bonus: 50,
      })
      puntosUsuarios[usuario] += 50
    }

    if (puntosActuales >= 2000 && puntosActuales - puntos < 2000) {
      nuevosLogros.push({
        id: "dos_mil_puntos",
        nombre: "Maestro Clasio",
        descripcion: "Alcanzaste 2000 puntos",
        puntos_bonus: 100,
      })
      puntosUsuarios[usuario] += 100
    }

    return NextResponse.json({
      success: true,
      puntosActuales: puntosUsuarios[usuario],
      puntosGanados: puntos,
      nivel: Math.floor(puntosUsuarios[usuario] / 200) + 1,
      nuevosLogros,
      message: `+${puntos} puntos ganados`,
    })
  } catch (error) {
    console.error("Error actualizando puntos:", error)
    return NextResponse.json({ success: false, error: "Error actualizando puntos" }, { status: 500 })
  }
}
