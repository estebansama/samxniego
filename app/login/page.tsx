"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { auth, isFirebaseConfigured } from "@/lib/firebaseClient"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!isFirebaseConfigured || !auth) {
        // Demo mode - simulate login
        console.log("Demo mode: Simulating login")

        // Simulate loading time
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Create demo user profile based on email
        const demoUser = {
          uid: "demo-" + Date.now(),
          email: email,
          nombre: email.split("@")[0],
          tipo: email.includes("docente") ? "docente" : email.includes("padre") ? "padre" : "alumno",
          curso: email.includes("docente") ? undefined : "Demo Course",
          createdAt: new Date().toISOString(),
        }

        // Store in localStorage for demo
        localStorage.setItem("clasio_user", JSON.stringify(demoUser))
        localStorage.setItem("token", "demo-token-" + Date.now())

        // Redirect based on user type
        switch (demoUser.tipo) {
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
        return
      }

      // Real Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Get user profile from API
      const token = await user.getIdToken()
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      })

      if (response.ok) {
        const data = await response.json()
        const userProfile = data.user

        // Store user data
        localStorage.setItem("clasio_user", JSON.stringify(userProfile))
        localStorage.setItem("token", token)

        // Redirect based on user type
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
      } else {
        setError("Error al verificar el usuario")
      }
    } catch (error: any) {
      console.error("Error en login:", error)
      if (error.code === "auth/user-not-found") {
        setError("Usuario no encontrado")
      } else if (error.code === "auth/wrong-password") {
        setError("Contraseña incorrecta")
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido")
      } else {
        setError("Error al iniciar sesión")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/clasio-logo.png" alt="Clasio" width={80} height={80} className="rounded-lg" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta de Clasio</CardDescription>
          {!isFirebaseConfigured && (
            <Alert className="mt-4">
              <AlertDescription>
                <strong>Modo Demo:</strong> Usa cualquier email y contraseña para probar la aplicación.
                <br />
                <small>Ejemplos: docente@demo.com, alumno@demo.com, padre@demo.com</small>
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
