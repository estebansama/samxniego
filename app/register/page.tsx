"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db, isFirebaseConfigured } from "@/lib/firebaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Mail, Lock, User, UserPlus, AlertCircle, GraduationCap, Info } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    tipo: "",
    curso: "",
    materias: [] as string[],
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Check if Firebase is available
  const isFirebaseAvailable = isFirebaseConfigured && auth !== null && db !== null

  const materiasList = [
    "Matemáticas",
    "Historia",
    "Literatura",
    "Ciencias",
    "Física",
    "Química",
    "Geografía",
    "Inglés",
    "Educación Física",
    "Arte",
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMateriaToggle = (materia: string) => {
    setFormData((prev) => ({
      ...prev,
      materias: prev.materias.includes(materia)
        ? prev.materias.filter((m) => m !== materia)
        : [...prev.materias, materia],
    }))
  }

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.nombre || !formData.tipo) {
      setError("Por favor completa todos los campos obligatorios")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    if (formData.tipo === "docente" && formData.materias.length === 0) {
      setError("Los docentes deben seleccionar al menos una materia")
      return false
    }

    if (formData.tipo === "alumno" && !formData.curso) {
      setError("Los alumnos deben especificar su curso")
      return false
    }

    return true
  }

  const handleDemoRegister = async () => {
    // Demo registration without Firebase
    const userProfile = {
      uid: `demo_${Date.now()}`,
      email: formData.email,
      nombre: formData.nombre,
      tipo: formData.tipo,
      curso: formData.tipo === "alumno" ? formData.curso : null,
      materias: formData.tipo === "docente" ? formData.materias : [],
      puntos: formData.tipo === "alumno" ? 0 : null,
      nivel: formData.tipo === "alumno" ? 1 : null,
      arquetipo: formData.tipo === "alumno" ? "gamer" : null,
      fechaCreacion: new Date().toISOString(),
      activo: true,
    }

    // Guardar datos en localStorage para demo
    localStorage.setItem("clasio_user", JSON.stringify(userProfile))
    localStorage.setItem("token", `demo_token_${Date.now()}`)

    // Redirigir según el tipo de usuario
    switch (formData.tipo) {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (!isFirebaseAvailable) {
        // Use demo mode if Firebase is not available
        console.log("Using demo registration mode")
        await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate network delay
        await handleDemoRegister()
        return
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth!, formData.email, formData.password)
      const user = userCredential.user

      // Crear perfil en Firestore
      const userProfile = {
        uid: user.uid,
        email: user.email,
        nombre: formData.nombre,
        tipo: formData.tipo,
        curso: formData.tipo === "alumno" ? formData.curso : null,
        materias: formData.tipo === "docente" ? formData.materias : [],
        puntos: formData.tipo === "alumno" ? 0 : null,
        nivel: formData.tipo === "alumno" ? 1 : null,
        arquetipo: formData.tipo === "alumno" ? "gamer" : null,
        fechaCreacion: new Date().toISOString(),
        activo: true,
      }

      await setDoc(doc(db!, "users", user.uid), userProfile)

      // Guardar datos en localStorage para compatibilidad
      localStorage.setItem("clasio_user", JSON.stringify(userProfile))
      const token = await user.getIdToken()
      localStorage.setItem("token", token)

      // Redirigir según el tipo de usuario
      switch (formData.tipo) {
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
      console.error("Error en registro:", error)

      let errorMessage = "Error al crear la cuenta"

      // Check if this is a Firebase-related error
      if (error.code && error.code.startsWith("auth/")) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "Ya existe una cuenta con este email"
            break
          case "auth/invalid-email":
            errorMessage = "Email inválido"
            break
          case "auth/weak-password":
            errorMessage = "La contraseña debe tener al menos 6 caracteres"
            break
          case "auth/network-request-failed":
            errorMessage = "Error de conexión. Verifica tu internet"
            break
          case "auth/configuration-not-found":
          case "auth/invalid-api-key":
            errorMessage = "Error de configuración de Firebase"
            console.log("Firebase configuration error, falling back to demo mode")
            await handleDemoRegister()
            return
          default:
            errorMessage = error.message || "Error de autenticación"
        }
        setError(errorMessage)
      } else {
        // If it's not a Firebase error or Firebase is not configured, use demo mode
        console.log("Non-Firebase error or Firebase not configured, using demo mode:", error.message)
        await handleDemoRegister()
        return
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-white">C</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-600">Únete a la comunidad educativa de Clasio</CardDescription>

            {/* Firebase Status Indicator */}
            {!isFirebaseAvailable && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Modo Demo:</strong> Firebase no está configurado. Los datos se guardarán localmente para la
                  demostración.
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h3>

                {/* Nombre */}
                <div className="space-y-2">
                  <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-primary"
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

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

                {/* Tipo de Usuario */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Usuario *</label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-primary">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docente">👨‍🏫 Docente</SelectItem>
                      <SelectItem value="alumno">🎓 Alumno</SelectItem>
                      <SelectItem value="padre">👨‍👩‍👧‍👦 Padre/Madre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Información Específica por Tipo */}
              {formData.tipo === "alumno" && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Información del Estudiante
                  </h4>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Curso *</label>
                    <Select value={formData.curso} onValueChange={(value) => handleInputChange("curso", value)}>
                      <SelectTrigger className="border-2 border-gray-200 focus:border-primary">
                        <SelectValue placeholder="Selecciona tu curso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1°A">1° Año A</SelectItem>
                        <SelectItem value="1°B">1° Año B</SelectItem>
                        <SelectItem value="2°A">2° Año A</SelectItem>
                        <SelectItem value="2°B">2° Año B</SelectItem>
                        <SelectItem value="3°A">3° Año A</SelectItem>
                        <SelectItem value="3°B">3° Año B</SelectItem>
                        <SelectItem value="4°A">4° Año A</SelectItem>
                        <SelectItem value="4°B">4° Año B</SelectItem>
                        <SelectItem value="5°A">5° Año A</SelectItem>
                        <SelectItem value="5°B">5° Año B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {formData.tipo === "docente" && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800">Materias que Enseñas *</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {materiasList.map((materia) => (
                      <label key={materia} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.materias.includes(materia)}
                          onChange={() => handleMateriaToggle(materia)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          disabled={loading}
                        />
                        <span className="text-sm text-gray-700">{materia}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.tipo === "padre" && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800">Información del Padre/Madre</h4>
                  <p className="text-sm text-purple-700">
                    Podrás vincular a tus hijos después de crear la cuenta y que ellos se registren.
                  </p>
                </div>
              )}

              {/* Contraseñas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Seguridad
                </h3>

                {/* Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
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

                {/* Confirmar Contraseña */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-primary"
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={loading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Botón de Registro */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    {isFirebaseAvailable ? "Crear Cuenta" : "Crear Cuenta (Demo)"}
                  </div>
                )}
              </Button>
            </form>

            {/* Enlaces adicionales */}
            <div className="mt-6 text-center space-y-2">
              <div className="text-sm text-gray-500">
                ¿Ya tienes cuenta?{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                  onClick={() => router.push("/login")}
                >
                  Inicia sesión aquí
                </button>
              </div>

              <button
                type="button"
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                onClick={() => router.push("/")}
              >
                ← Volver al inicio
              </button>
            </div>

            {/* Términos y Condiciones */}
            <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                Al crear una cuenta, aceptas nuestros{" "}
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
