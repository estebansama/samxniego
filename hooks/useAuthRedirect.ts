"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "./useAuth"

export function useAuthRedirect(requiredUserType?: string) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in, redirect to login
        router.push("/login")
      } else if (requiredUserType) {
        // Check if user has the required type
        const userData = localStorage.getItem("clasio_user")
        if (userData) {
          const userProfile = JSON.parse(userData)
          if (userProfile.tipo !== requiredUserType) {
            // User doesn't have required type, redirect to their dashboard
            router.push(`/${userProfile.tipo}`)
          }
        }
      }
    }
  }, [user, loading, requiredUserType, router])

  return { user, loading }
}
