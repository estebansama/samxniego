import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore"
import { db } from "./firebase"

// Tipos de datos
export interface Minijuego {
  id?: string
  titulo: string
  descripcion: string
  tipo: "trivia" | "memoria" | "verdadero_falso" | "completar" | "ordenar" | "debate" | "equipo"
  materia: string
  dificultad: "Fácil" | "Medio" | "Difícil"
  preguntas: any[]
  creadorId: string
  fechaCreacion: any
  activo: boolean
}

export interface Puntuacion {
  id?: string
  usuarioId: string
  minijuegoId: string
  puntos: number
  respuestasCorrectas: number
  totalPreguntas: number
  tiempoCompletado: number
  fecha: any
}

export interface Propuesta {
  id?: string
  titulo: string
  descripcion: string
  autorId: string
  autorNombre: string
  votos: number
  votantes: string[]
  estado: "activa" | "aprobada" | "rechazada"
  costoPuntos: number
  fechaCreacion: any
}

// Funciones para Minijuegos
export const crearMinijuego = async (minijuego: Omit<Minijuego, "id" | "fechaCreacion">) => {
  try {
    const docRef = await addDoc(collection(db, "minijuegos"), {
      ...minijuego,
      fechaCreacion: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creando minijuego:", error)
    return { success: false, error }
  }
}

export const obtenerMinijuegos = async (creadorId?: string) => {
  try {
    let q = query(collection(db, "minijuegos"), orderBy("fechaCreacion", "desc"))

    if (creadorId) {
      q = query(collection(db, "minijuegos"), where("creadorId", "==", creadorId), orderBy("fechaCreacion", "desc"))
    }

    const querySnapshot = await getDocs(q)
    const minijuegos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Minijuego[]

    return { success: true, minijuegos }
  } catch (error) {
    console.error("Error obteniendo minijuegos:", error)
    return { success: false, error, minijuegos: [] }
  }
}

export const actualizarMinijuego = async (id: string, datos: Partial<Minijuego>) => {
  try {
    await updateDoc(doc(db, "minijuegos", id), datos)
    return { success: true }
  } catch (error) {
    console.error("Error actualizando minijuego:", error)
    return { success: false, error }
  }
}

export const eliminarMinijuego = async (id: string) => {
  try {
    await deleteDoc(doc(db, "minijuegos", id))
    return { success: true }
  } catch (error) {
    console.error("Error eliminando minijuego:", error)
    return { success: false, error }
  }
}

// Funciones para Puntuaciones
export const guardarPuntuacion = async (puntuacion: Omit<Puntuacion, "id" | "fecha">) => {
  try {
    const docRef = await addDoc(collection(db, "puntuaciones"), {
      ...puntuacion,
      fecha: serverTimestamp(),
    })

    // Actualizar puntos del usuario
    await actualizarPuntosUsuario(puntuacion.usuarioId, puntuacion.puntos)

    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error guardando puntuación:", error)
    return { success: false, error }
  }
}

export const obtenerPuntuacionesUsuario = async (usuarioId: string) => {
  try {
    const q = query(
      collection(db, "puntuaciones"),
      where("usuarioId", "==", usuarioId),
      orderBy("fecha", "desc"),
      limit(10),
    )

    const querySnapshot = await getDocs(q)
    const puntuaciones = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Puntuacion[]

    return { success: true, puntuaciones }
  } catch (error) {
    console.error("Error obteniendo puntuaciones:", error)
    return { success: false, error, puntuaciones: [] }
  }
}

// Funciones para Propuestas
export const crearPropuesta = async (propuesta: Omit<Propuesta, "id" | "fechaCreacion" | "votos" | "votantes">) => {
  try {
    const docRef = await addDoc(collection(db, "propuestas"), {
      ...propuesta,
      votos: 0,
      votantes: [],
      fechaCreacion: serverTimestamp(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creando propuesta:", error)
    return { success: false, error }
  }
}

export const obtenerPropuestas = async () => {
  try {
    const q = query(collection(db, "propuestas"), orderBy("fechaCreacion", "desc"))
    const querySnapshot = await getDocs(q)
    const propuestas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Propuesta[]

    return { success: true, propuestas }
  } catch (error) {
    console.error("Error obteniendo propuestas:", error)
    return { success: false, error, propuestas: [] }
  }
}

export const votarPropuesta = async (propuestaId: string, usuarioId: string) => {
  try {
    const propuestaRef = doc(db, "propuestas", propuestaId)
    const propuestaDoc = await getDoc(propuestaRef)

    if (!propuestaDoc.exists()) {
      return { success: false, error: "Propuesta no encontrada" }
    }

    const propuesta = propuestaDoc.data() as Propuesta

    if (propuesta.votantes.includes(usuarioId)) {
      return { success: false, error: "Ya has votado en esta propuesta" }
    }

    await updateDoc(propuestaRef, {
      votos: increment(1),
      votantes: [...propuesta.votantes, usuarioId],
    })

    return { success: true }
  } catch (error) {
    console.error("Error votando propuesta:", error)
    return { success: false, error }
  }
}

// Funciones auxiliares
export const actualizarPuntosUsuario = async (usuarioId: string, puntos: number) => {
  try {
    const userRef = doc(db, "users", usuarioId)
    await updateDoc(userRef, {
      puntos: increment(puntos),
    })
    return { success: true }
  } catch (error) {
    console.error("Error actualizando puntos:", error)
    return { success: false, error }
  }
}

export const obtenerEstadisticasUsuario = async (usuarioId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", usuarioId))
    const puntuacionesResult = await obtenerPuntuacionesUsuario(usuarioId)

    if (!userDoc.exists()) {
      return { success: false, error: "Usuario no encontrado" }
    }

    const userData = userDoc.data()
    const puntuaciones = puntuacionesResult.puntuaciones || []

    const estadisticas = {
      puntosTotales: userData.puntos || 0,
      nivel: Math.floor((userData.puntos || 0) / 200) + 1,
      juegosCompletados: puntuaciones.length,
      promedioAciertos:
        puntuaciones.length > 0
          ? (puntuaciones.reduce((acc, p) => acc + p.respuestasCorrectas / p.totalPreguntas, 0) / puntuaciones.length) *
            100
          : 0,
      ultimaActividad: puntuaciones[0]?.fecha || userData.fechaCreacion,
    }

    return { success: true, estadisticas }
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error)
    return { success: false, error }
  }
}
