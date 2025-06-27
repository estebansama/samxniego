import { type NextRequest, NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebase-admin"

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json({ success: false, error: "Token requerido" }, { status: 400 })
    }

    // Verificar el token de Firebase
    const decodedToken = await adminAuth.verifyIdToken(idToken)

    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
      verified: true,
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
