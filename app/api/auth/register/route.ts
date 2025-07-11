import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { email, password, nombre, tipo, curso, materias } = await request.json()

    // Validar datos requeridos
    if (!email || !password || !nombre || !tipo) {
      return NextResponse.json({ success: false, error: "Datos incompletos" }, { status: 400 })
    }

    // Crear usuario en Firebase Auth
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: nombre,
    })

    // Crear perfil de usuario en Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      nombre,
      tipo,
      curso: tipo === "alumno" ? curso : null,
      materias: tipo === "docente" ? materias : [],
      puntos: tipo === "alumno" ? 0 : null,
      nivel: tipo === "alumno" ? 1 : null,
      arquetipo: tipo === "alumno" ? "gamer" : null,
      fechaCreacion: new Date(),
      activo: true,
    }

    await adminDb.collection("users").doc(userRecord.uid).set(userProfile)

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: "Usuario creado exitosamente",
    })
  } catch (error: any) {
    console.error("Error en registro:", error)

    let errorMessage = "Error al crear usuario"
    if (error.code === "auth/email-already-exists") {
      errorMessage = "El email ya está registrado"
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Email inválido"
    } else if (error.code === "auth/weak-password") {
      errorMessage = "La contraseña es muy débil"
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 })
  }
}
