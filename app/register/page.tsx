"use client"

import type React from "react"

import { auth, isFirebaseConfigured } from "@/lib/firebaseClient"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, User, GraduationCap, AlertCircle } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre: "",
    tipo: "",
    curso: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { email, password, confirmPassword, nombre, tipo, curso } = formData

    if (!email || !password || !confirmPassword || !nombre || !tipo) {
      setError("Por favor completá todos los campos obligatorios.")
      return false
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.")
      return false
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return false
    }

    if (tipo === "alumno" && !curso) {
      setError("El curso es obligatorio para alumnos.")
      return false
    }

    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")

    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error("Firebase no está configurado")
      }

      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password)

      // Opcional: setear nombre en Firebase Auth
      await updateProfile(user, { displayName: formData.nombre })

      // Podrías guardar en Firestore acá si querés

      const userProfile = {
        uid: user.uid,
        email: user.email,
        nombre: formData.nombre,
        tipo: formData.tipo,
        curso: formData.tipo === "alumno" ? formData.curso : null,
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("clasio_user", JSON.stringify(userProfile))
        localStorage.setItem("token", await user.getIdToken())
      }

      router.push(`/${formData.tipo}`)
    } catch (error: any) {
      console.error("Register error:", error)
      setError("Error al crear la cuenta. Intenta con otro email.")
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <img
                src="https://edu8uatvnzt2gwze.public.blob.vercel-storage.com/clasio-logo-JlTBTWFZiiSJdBi1ydgbVheAJPlfgR.png"
                alt="Clasio Logo"
                className="h-14 w-auto"
                onError={(e) => {
                  // Fallback to CSS logo if image fails to load
                  e.target.style.display = "none"
                  e.target.nextElementSibling.style.display = "flex"
                }}
              />
              <div
                className="h-14 w-14 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg"
                style={{ display: "none" }}
              >
                <span className="text-xl font-bold text-white">C</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Crear Cuenta</CardTitle>
            <CardDescription className="text-gray-600">Registrate en Clasio</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Confirmar Contraseña *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Tipo de Usuario *</label>
                <Select value={formData.tipo} onValueChange={(value) => handleInputChange("tipo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccioná un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alumno">Alumno</SelectItem>
                    <SelectItem value="docente">Docente</SelectItem>
                    <SelectItem value="padre">Padre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.tipo === "alumno" && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Curso *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      value={formData.curso}
                      onChange={(e) => handleInputChange("curso", e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <Alert variant="destructive" className="animate-slide-up">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
              >
                {loading ? "Creando cuenta..." : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                ¿Ya tenés una cuenta?{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium"
                  onClick={() => router.push("/login")}
                >
                  Iniciá sesión acá
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
