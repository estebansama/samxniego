"use client"

import { useState, useEffect } from "react"
import type { User } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

interface UserProfile {
  uid: string
  email: string
  nombre: string
  tipo: "docente" | "alumno" | "padre"
  curso?: string
  materias?: string[]
  hijos?: any[]
  arquetipo?: string
  nivel?: number
  puntos?: number
  fechaCreacion: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: result.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)

      const userProfile: UserProfile = {
        uid: result.user.uid,
        email: result.user.email!,
        fechaCreacion: new Date().toISOString(),
        ...profileData,
      }

      await setDoc(doc(db, "users", result.user.uid), userProfile)
      setUserProfile(userProfile)

      return { success: true, user: result.user }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUserProfile(null)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
  }
}
