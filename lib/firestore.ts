import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  Timestamp,
} from "firebase/firestore"

// Tipos de datos
export interface UserProfile {
  uid: string
  email: string
  nombre: string
  tipo: "alumno" | "docente" | "padre"
  curso?: string
  materias?: string[]
  puntos?: number
  nivel?: number
  arquetipo?: string
  fechaCreacion: Timestamp
  activo: boolean
}

export interface Minijuego {
  id: string
  titulo: string
  descripcion: string
  tipo: string
  materia: string
  preguntas: any[]
  createdBy: string
  fechaCreacion: Timestamp
  activo: boolean
}

export interface Propuesta {
  id: string
  titulo: string
  descripcion: string
  autor: string
  votos: number
  estado: "activa" | "aprobada" | "rechazada"
  fechaCreacion: Timestamp
}

// Funciones para usuarios
export async function createUserProfile(userProfile: Omit<UserProfile, "fechaCreacion">) {
  try {
    const userRef = doc(db, "users", userProfile.uid)
    await setDoc(userRef, {
      ...userProfile,
      fechaCreacion: Timestamp.now(),
    })
    return { success: true }
  } catch (error) {
    console.error("Error creating user profile:", error)
    return { success: false, error }
  }
}

export async function getUserProfile(uid: string) {
  try {
    const userRef = doc(db, "users", uid)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() as UserProfile }
    } else {
      return { success: false, error: "User not found" }
    }
  } catch (error) {
    console.error("Error getting user profile:", error)
    return { success: false, error }
  }
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  try {
    const userRef = doc(db, "users", uid)
    await updateDoc(userRef, updates)
    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error }
  }
}

// Funciones para minijuegos
export async function createMinijuego(minijuego: Omit<Minijuego, "id" | "fechaCreacion">) {
  try {
    const minijuegosRef = collection(db, "minijuegos")
    const docRef = await addDoc(minijuegosRef, {
      ...minijuego,
      fechaCreacion: Timestamp.now(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating minijuego:", error)
    return { success: false, error }
  }
}

export async function getMinijuegosByMateria(materia: string) {
  try {
    const minijuegosRef = collection(db, "minijuegos")
    const q = query(
      minijuegosRef,
      where("materia", "==", materia),
      where("activo", "==", true),
      orderBy("fechaCreacion", "desc"),
    )

    const querySnapshot = await getDocs(q)
    const minijuegos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: minijuegos }
  } catch (error) {
    console.error("Error getting minijuegos:", error)
    return { success: false, error }
  }
}

// Funciones para propuestas
export async function createPropuesta(propuesta: Omit<Propuesta, "id" | "fechaCreacion">) {
  try {
    const propuestasRef = collection(db, "propuestas")
    const docRef = await addDoc(propuestasRef, {
      ...propuesta,
      fechaCreacion: Timestamp.now(),
    })
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error("Error creating propuesta:", error)
    return { success: false, error }
  }
}

export async function getPropuestasActivas() {
  try {
    const propuestasRef = collection(db, "propuestas")
    const q = query(propuestasRef, where("estado", "==", "activa"), orderBy("fechaCreacion", "desc"))

    const querySnapshot = await getDocs(q)
    const propuestas = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))

    return { success: true, data: propuestas }
  } catch (error) {
    console.error("Error getting propuestas:", error)
    return { success: false, error }
  }
}

export async function votarPropuesta(propuestaId: string) {
  try {
    const propuestaRef = doc(db, "propuestas", propuestaId)
    const propuestaSnap = await getDoc(propuestaRef)

    if (propuestaSnap.exists()) {
      const currentVotos = propuestaSnap.data().votos || 0
      await updateDoc(propuestaRef, {
        votos: currentVotos + 1,
      })
      return { success: true }
    } else {
      return { success: false, error: "Propuesta not found" }
    }
  } catch (error) {
    console.error("Error voting propuesta:", error)
    return { success: false, error }
  }
}
