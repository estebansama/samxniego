"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Brain, Sparkles, Clock, Target, BookOpen, Users, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function DocentePage() {
  const [user, setUser] = useState(null)
  const [contenido, setContenido] = useState("")
  const [tipo, setTipo] = useState("texto")
  const [materia, setMateria] = useState("Matemáticas")
  const [minijuego, setMinijuego] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editedMinijuego, setEditedMinijuego] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("clasio_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const generarMinijuego = async () => {
    if (!contenido.trim()) {
      alert("Por favor ingresa contenido para generar el minijuego")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/contenido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido,
          tipo,
          materia,
          nivel: "Secundario",
          proveedor: "auto",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setMinijuego(data)
      setEditedMinijuego(data.minijuego)
      setEditMode(false)
    } catch (error) {
      console.error("Error al generar el minijuego:", error)
      alert("Error al generar el minijuego. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const guardarCambios = () => {
    setMinijuego({
      ...minijuego,
      minijuego: editedMinijuego,
    })
    setEditMode(false)
  }

  const cancelarEdicion = () => {
    setEditedMinijuego(minijuego?.minijuego)
    setEditMode(false)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <img src="/clasio-logo.png" alt="Clasio Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Panel Docente</h1>
              <p className="text-gray-600">Generador de Minijuegos con IA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary border-primary">
              👨‍🏫 {user?.nombre || "Docente"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel de Configuración */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Configuración del Minijuego
              </CardTitle>
              <CardDescription>Ingresa el contenido y configura los parámetros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Contenido Educativo</label>
                <Textarea
                  placeholder="Ingresa el contenido que quieres convertir en minijuego..."
                  className="min-h-32 border-2 border-gray-200 focus:border-primary"
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Puedes ingresar texto, descripción de imagen, resumen de documento o contenido web
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Tipo de Contenido</label>
                  <Select value={tipo} onValueChange={setTipo}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">📝 Texto</SelectItem>
                      <SelectItem value="imagen">🖼️ Imagen</SelectItem>
                      <SelectItem value="archivo">📄 Documento</SelectItem>
                      <SelectItem value="link">🔗 Enlace Web</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Materia</label>
                  <Select value={materia} onValueChange={setMateria}>
                    <SelectTrigger className="border-2 border-gray-200 focus:border-primary">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Matemáticas">🔢 Matemáticas</SelectItem>
                      <SelectItem value="Historia">📚 Historia</SelectItem>
                      <SelectItem value="Literatura">📖 Literatura</SelectItem>
                      <SelectItem value="Ciencias">🔬 Ciencias</SelectItem>
                      <SelectItem value="Física">⚛️ Física</SelectItem>
                      <SelectItem value="Química">🧪 Química</SelectItem>
                      <SelectItem value="Geografía">🌍 Geografía</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generarMinijuego}
                disabled={isLoading || !contenido.trim()}
                className="w-full h-12 bg-gradient-to-r from-primary to-secondary text-black font-semibold text-lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                    Generando con IA...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Generar Minijuego
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Panel de Resultado */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-secondary" />
                  Minijuego Generado
                </CardTitle>
                {minijuego && (
                  <div className="flex gap-2">
                    {!editMode ? (
                      <Button onClick={() => setEditMode(true)} variant="outline" size="sm">
                        ✏️ Editar
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button onClick={guardarCambios} size="sm" className="bg-green-600 text-white">
                          ✅ Guardar
                        </Button>
                        <Button onClick={cancelarEdicion} variant="outline" size="sm">
                          ❌ Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <CardDescription>
                {minijuego ? "Revisa y edita el minijuego generado" : "Aquí aparecerá tu minijuego"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {minijuego ? (
                <div className="space-y-6">
                  {/* Información del Minijuego */}
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      {editMode ? (
                        <Input
                          value={editedMinijuego?.titulo || ""}
                          onChange={(e) => setEditedMinijuego({ ...editedMinijuego, titulo: e.target.value })}
                          className="text-lg font-bold bg-white"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-gray-800">{minijuego.minijuego?.titulo}</h3>
                      )}
                      <div className="flex gap-2">
                        {minijuego.minijuego?.generadoPorIA && (
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                            🧠 {minijuego.minijuego.proveedorIA}
                          </Badge>
                        )}
                        <Badge variant="outline">{minijuego.minijuego?.dificultad}</Badge>
                      </div>
                    </div>

                    {editMode ? (
                      <Textarea
                        value={editedMinijuego?.descripcion || ""}
                        onChange={(e) => setEditedMinijuego({ ...editedMinijuego, descripcion: e.target.value })}
                        className="bg-white"
                      />
                    ) : (
                      <p className="text-gray-700">{minijuego.minijuego?.descripcion}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {minijuego.minijuego?.tiempoEstimado}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {minijuego.minijuego?.tipo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {minijuego.minijuego?.arquetipos?.join(", ")}
                      </div>
                    </div>
                  </div>

                  {/* Preguntas */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Preguntas del Minijuego</h4>
                    {minijuego.minijuego?.preguntas?.map((pregunta, index) => (
                      <div key={index} className="p-4 border-2 border-gray-200 rounded-lg">
                        <div className="space-y-3">
                          {editMode ? (
                            <Textarea
                              value={pregunta.pregunta}
                              onChange={(e) => {
                                const newPreguntas = [...editedMinijuego.preguntas]
                                newPreguntas[index] = { ...newPreguntas[index], pregunta: e.target.value }
                                setEditedMinijuego({ ...editedMinijuego, preguntas: newPreguntas })
                              }}
                              className="font-medium"
                            />
                          ) : (
                            <h5 className="font-medium text-gray-800">
                              {index + 1}. {pregunta.pregunta}
                            </h5>
                          )}

                          {pregunta.opciones && (
                            <div className="grid grid-cols-1 gap-2">
                              {pregunta.opciones.map((opcion, opcionIndex) => (
                                <div
                                  key={opcionIndex}
                                  className={`p-2 rounded text-sm ${
                                    opcion === pregunta.respuestaCorrecta
                                      ? "bg-green-100 border-2 border-green-300 text-green-800"
                                      : "bg-gray-50 border border-gray-200"
                                  }`}
                                >
                                  {editMode ? (
                                    <Input
                                      value={opcion}
                                      onChange={(e) => {
                                        const newPreguntas = [...editedMinijuego.preguntas]
                                        newPreguntas[index].opciones[opcionIndex] = e.target.value
                                        setEditedMinijuego({ ...editedMinijuego, preguntas: newPreguntas })
                                      }}
                                      className="text-sm"
                                    />
                                  ) : (
                                    <span>
                                      {String.fromCharCode(65 + opcionIndex)}. {opcion}
                                      {opcion === pregunta.respuestaCorrecta && " ✓"}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {pregunta.explicacion && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Explicación:</strong> {pregunta.explicacion}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Puntaje: {pregunta.puntaje} puntos</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Objetivos de Aprendizaje */}
                  {minijuego.minijuego?.objetivosAprendizaje && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">🎯 Objetivos de Aprendizaje</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {minijuego.minijuego.objetivosAprendizaje.map((objetivo, index) => (
                          <li key={index}>{objetivo}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Nota del Sistema */}
                  {minijuego.minijuego?.nota && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>ℹ️ Nota:</strong> {minijuego.minijuego.nota}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configura el contenido y genera tu primer minijuego</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
