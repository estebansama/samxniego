"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, isFirebaseConfigured } from "@/lib/firebaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, LogIn, AlertCircle, Info } from "lucide-react"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Check if Firebase is available
  const isFirebaseAvailable = isFirebaseConfigured && auth !== null

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos")
      return false
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    return true
  }

  const handleDemoLogin = async () => {
    // Demo login without Firebase
    let userType = "alumno"
    let userName = "Usuario Demo"

    // Determine user type based on email
    if (formData.email.includes("docente")) {
      userType = "docente"
      userName = "Profesor Demo"
    } else if (formData.email.includes("padre")) {
      userType = "padre"
      userName = "Padre Demo"
    }

    const userProfile = {
      uid: `demo_${Date.now()}`,
      email: formData.email,
      nombre: userName,
      tipo: userType,
      curso: userType === "alumno" ? "3°A" : null,
      materias: userType === "docente" ? ["Matemáticas", "Física"] : [],
      puntos: userType === "alumno" ? 150 : null,
      nivel: userType === "alumno" ? 2 : null,
      arquetipo: userType === "alumno" ? "gamer" : null,
      fechaCreacion: new Date().toISOString(),
      activo: true,
    }

    // Save demo user data
    localStorage.setItem("clasio_user", JSON.stringify(userProfile))
    localStorage.setItem("token", `demo_token_${Date.now()}`)

    // Redirect based on user type
    switch (userType) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (!isFirebaseAvailable) {
        // Use demo mode if Firebase is not available
        console.log("Using demo login mode")
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        await handleDemoLogin()
        return
      }

      // Firebase authentication
      const userCredential = await signInWithEmailAndPassword(auth!, formData.email, formData.password)
      const user = userCredential.user

      // Get user profile from localStorage or create default
      let userProfile = localStorage.getItem("clasio_user")

      if (!userProfile) {
        // Create default profile if not exists
        const defaultProfile = {
          uid: user.uid,
          email: user.email,
          nombre: user.email?.split("@")[0] || "Usuario",
          tipo: "alumno",
          curso: "3°A",
          materias: [],
          puntos: 0,
          nivel: 1,
          arquetipo: "gamer",
          fechaCreacion: new Date().toISOString(),
          activo: true,
        }
        userProfile = JSON.stringify(defaultProfile)
        localStorage.setItem("clasio_user", userProfile)
      }

      const profile = JSON.parse(userProfile)
      const token = await user.getIdToken()
      localStorage.setItem("token", token)

      // Redirect based on user type
      switch (profile.tipo) {
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
    } catch (error: any) {
      console.error("Error en login:", error)

      let errorMessage = "Error al iniciar sesión"

      if (error.code && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/user-not-found":
          case "auth/wrong-password":
            errorMessage = "Email o contraseña incorrectos"
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido"
            break
          case "auth/user-disabled":
            errorMessage = "Esta cuenta ha sido deshabilitada"
            break
          case "auth/too-many-requests":
            errorMessage = "Demasiados intentos fallidos. Intenta más tarde"
            break
          case "auth/network-request-failed":
            errorMessage = "Error de conexión. Verifica tu internet"
            break
          default:
            errorMessage = error.message || "Error de autenticación"
        }
        setError(errorMessage)
      } else {
        // If it's not a Firebase error, use demo mode
        console.log("Non-Firebase error, using demo mode:", error.message)
        await handleDemoLogin()
        return
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">C</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">Accede a tu cuenta de Clasio</CardDescription>

            {/* Firebase Status Indicator */}
            {!isFirebaseAvailable && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Demo:</strong> Firebase no está configurado. Puedes usar credenciales de prueba.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Demo Credentials Info */}
              {!isFirebaseAvailable && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Credenciales de Prueba:</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      👨‍🏫 Docente: <code>docente@demo.com</code>
                    </div>
                    <div>
                      🎓 Alumno: <code>alumno@demo.com</code>
                    </div>
                    <div>
                      👨‍👩‍👧‍👦 Padre: <code>padre@demo.com</code>
                    </div>
                    <div>
                      🔑 Contraseña: <code>demo123</code>
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10 h-12 border-2 border-gray-200 focus:border-primary"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-primary"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    {isFirebaseAvailable ? "Iniciar Sesión" : "Iniciar Sesión (Demo)"}
                  </div>
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-500">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                  onClick={() => router.push("/register")}
                >
                  Regístrate aquí
                </button>
              </div>

              {isFirebaseAvailable && (
                <button
                  type="button"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => {
                    // TODO: Implement password reset
                    alert("Funcionalidad de recuperación de contraseña próximamente")
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              )}

              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => router.push("/")}
              >
                ← Volver al inicio
              </button>
            </div>

            {/* Terms and Conditions */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Al iniciar sesión, aceptas nuestros{" "}
                <span className="text-primary cursor-pointer hover:underline">Términos de Servicio</span> y{" "}
                <span className="text-primary cursor-pointer hover:underline">Política de Privacidad</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
