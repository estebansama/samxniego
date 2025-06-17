import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, tipo } = await request.json()

    if (!email || !tipo) {
      return NextResponse.json({ success: false, error: "Email y tipo son requeridos" }, { status: 400 })
    }

    // Simular validación y generación de token
    const token = `clasio_${tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Datos simulados del usuario según el tipo
    const userData = {
      docente: {
        id: 1,
        nombre: "Prof. María González",
        email,
        tipo: "docente",
        materias: ["Matemáticas", "Física"],
        cursos: ["3°A", "3°B", "4°A"],
      },
      alumno: {
        id: 2,
        nombre: "Juan Estudiante",
        email,
        tipo: "alumno",
        curso: "3°A",
        arquetipo: "gamer",
        nivel: 8,
        puntos: 1250,
      },
      padre: {
        id: 3,
        nombre: "Carlos Padre",
        email,
        tipo: "padre",
        hijos: [
          {
            nombre: "Juan Estudiante",
            curso: "3°A",
            id: 2,
          },
        ],
      },
    }

    const user = userData[tipo as keyof typeof userData]

    return NextResponse.json({
      success: true,
      token,
      user,
      message: "Login exitoso",
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
