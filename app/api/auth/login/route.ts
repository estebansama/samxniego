import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ success: false, error: "Token requerido" }, { status: 400 })
    }

    // Verificar el token de Firebase
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Obtener perfil del usuario
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    const userProfile = userDoc.data()

    return NextResponse.json({
      success: true,
      user: userProfile,
      message: "Login exitoso",
    })
  } catch (error: any) {
    console.error("Error en login:", error)

    let errorMessage = "Error al iniciar sesión"
    if (error.code === "auth/id-token-expired") {
      errorMessage = "Token expirado"
    } else if (error.code === "auth/id-token-revoked") {
      errorMessage = "Token revocado"
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 })
  }
}
