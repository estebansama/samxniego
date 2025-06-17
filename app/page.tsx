"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, BookOpen, Sparkles } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [userType, setUserType] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!email || !userType) return

    setLoading(true)

    // Simular llamada a API
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, tipo: userType }),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem("clasio_token", data.token)
      localStorage.setItem("clasio_user", JSON.stringify(data.user))

      // Redirigir según el tipo de usuario
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
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="text-center lg:text-left space-y-6 animate-slide-up">
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-8 leading-7 leading-3">
            <img src="/clasio-logo.png" alt="Clasio Logo" className="h-20 w-auto" />
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight font-serif font-sans font-serif">
            Transforma el celular en tu aliado educativo
          </h2>

          <p className="text-lg text-gray-600 leading-relaxed">
            Inteligencia artificial, gamificación y personalización para revolucionar la experiencia de aprendizaje en
            colegios secundarios.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-medium">IA Educativa</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
              <Users className="h-6 w-6 text-secondary" />
              <span className="font-medium">Gamificación</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-xl">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-medium">Personalización</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <Card className="w-full max-w-md mx-auto animate-bounce-in shadow-2xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-gray-800">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">Ingresa a tu cuenta de Clasio</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-gray-200 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo de Usuario</label>
              <Select value={userType} onValueChange={setUserType}>
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

            <Button
              onClick={handleLogin}
              disabled={!email || !userType || loading}
              className="w-full h-12 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-black font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              {loading ? "Ingresando..." : "Ingresar a Clasio"}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-4 space-y-2">
              <p>Demo - Usa cualquier email para probar</p>
              <div>
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                  onClick={() => router.push("/register")}
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
