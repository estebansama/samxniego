"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebaseClient"

export function useAuthRedirect() {
  const router = useRouter()

  useEffect(() => {
    // If Firebase is not configured, skip auth state listening
    if (!isFirebaseConfigured || !auth) {
      console.log("Firebase not configured, skipping auth state listener")
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verificar que el usuario tenga un perfil completo
          const token = await user.getIdToken()
          const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: token }),
          })

          if (response.ok) {
            const data = await response.json()
            const userProfile = data.user

            // Guardar en localStorage para compatibilidad
            localStorage.setItem("clasio_user", JSON.stringify(userProfile))
            localStorage.setItem("token", token)

            // Redirigir según el tipo de usuario
            switch (userProfile.tipo) {
              case "docente":
                router.push("/docente")
                break
              case "alumno":
                router.push("/alumno")
                break
              case "padre":
                router.push("/padre")
                break
              default:
                router.push("/")
            }
          }
        } catch (error) {
          console.error("Error verificando usuario:", error)
        }
      }
    })

    return () => unsubscribe()
  }, [router])
}
