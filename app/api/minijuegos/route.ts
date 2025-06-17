import { type NextRequest, NextResponse } from "next/server"
import { adminAuth, adminDb } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const creadorId = searchParams.get("creadorId")
    const materia = searchParams.get("materia")
    const activo = searchParams.get("activo")

    let query = adminDb.collection("minijuegos").orderBy("fechaCreacion", "desc")

    if (creadorId) {
      query = query.where("creadorId", "==", creadorId) as any
    }

    if (materia) {
      query = query.where("materia", "==", materia) as any
    }

    if (activo !== null) {
      query = query.where("activo", "==", activo === "true") as any
    }

    const snapshot = await query.get()
    const minijuegos = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      minijuegos,
    })
  } catch (error) {
    console.error("Error obteniendo minijuegos:", error)
    return NextResponse.json({ success: false, error: "Error obteniendo minijuegos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader) {
      return NextResponse.json({ success: false, error: "Token requerido" }, { status: 401 })
    }

    const idToken = authHeader.replace("Bearer ", "")
    const decodedToken = await adminAuth.verifyIdToken(idToken)
    const uid = decodedToken.uid

    const minijuegoData = await request.json()

    const docRef = await adminDb.collection("minijuegos").add({
      ...minijuegoData,
      creadorId: uid,
      fechaCreacion: new Date(),
      activo: true,
    })

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: "Minijuego creado exitosamente",
    })
  } catch (error) {
    console.error("Error creando minijuego:", error)
    return NextResponse.json({ success: false, error: "Error creando minijuego" }, { status: 500 })
  }
}
