import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ success: false, error: "Token requerido" }, { status: 400 })
    }

    // Verificar el token
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    // Obtener perfil del usuario desde Firestore
    const userDoc = await adminDb.collection("users").doc(uid).get()

    if (!userDoc.exists) {
      return NextResponse.json({ success: false, error: "Usuario no encontrado" }, { status: 404 })
    }

    const userProfile = userDoc.data()

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...userProfile,
      },
      message: "Token válido",
    })
  } catch (error: any) {
    console.error("Error verificando token:", error)

    let errorMessage = "Token inválido"
    if (error.code === "auth/id-token-expired") {
      errorMessage = "Token expirado"
    } else if (error.code === "auth/id-token-revoked") {
      errorMessage = "Token revocado"
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 })
  }
}
