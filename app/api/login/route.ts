import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, tipo } = await request.json()

    // Simular validación de usuario
    if (!email || !tipo) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Simular datos de usuario según el tipo
    let userData = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      tipo,
      nombre: "Usuario Demo",
      activo: true,
    }

    // Personalizar según el tipo de usuario
    switch (tipo) {
      case "docente":
        userData.nombre = "Profesor Demo"
        break
      case "alumno":
        userData.nombre = "Estudiante Demo"
        userData = { ...userData, curso: "3°A", puntos: 1250, nivel: 8 }
        break
      case "padre":
        userData.nombre = "Padre Demo"
        break
    }

    // Simular token JWT
    const token = `demo_token_${Date.now()}_${userData.id}`

    return NextResponse.json({
      success: true,
      user: userData,
      token,
      message: "Login exitoso",
    })
  } catch (error) {
    console.error("Error en login:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
