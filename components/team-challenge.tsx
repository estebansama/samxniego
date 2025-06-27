"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Clock, Target, CheckCircle, X } from "lucide-react"

interface TeamChallengeProps {
  challengeData: {
    pregunta: string
    tareas: string[]
    equiposRequeridos: number
    tiempoTotal: number
    cargando?: boolean
  }
  onComplete: (resultado: { puntos: number; colaboracion: string }) => void
  onClose: () => void
}

export function TeamChallenge({ challengeData, onComplete, onClose }: TeamChallengeProps) {
  const [tiempoRestante, setTiempoRestante] = useState(challengeData.tiempoTotal || 600)
  const [fase, setFase] = useState<"formacion" | "planificacion" | "ejecucion" | "presentacion" | "resultado">(
    "formacion",
  )
  const [equipoFormado, setEquipoFormado] = useState(false)
  const [tareasCompletadas, setTareasCompletadas] = useState<string[]>([])
  const [rolElegido, setRolElegido] = useState<string | null>(null)
  const [colaboracionScore, setColaboracionScore] = useState(0)

  useEffect(() => {
    if (challengeData.cargando) return

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          if (fase === "formacion") {
            setFase("planificacion")
            return 120 // 2 minutos para planificación
          } else if (fase === "planificacion") {
            setFase("ejecucion")
            return 300 // 5 minutos para ejecución
          } else if (fase === "ejecucion") {
            setFase("presentacion")
            return 120 // 2 minutos para presentación
          } else if (fase === "presentacion") {
            setFase("resultado")
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fase, challengeData.cargando])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const formarEquipo = () => {
    setEquipoFormado(true)
    setFase("planificacion")
    setTiempoRestante(120)
    setColaboracionScore((prev) => prev + 20)
  }

  const elegirRol = (rol: string) => {
    setRolElegido(rol)
    setColaboracionScore((prev) => prev + 15)
  }

  const completarTarea = (tarea: string) => {
    if (!tareasCompletadas.includes(tarea)) {
      setTareasCompletadas([...tareasCompletadas, tarea])
      setColaboracionScore((prev) => prev + 25)
    }
  }

  const finalizarDesafio = () => {
    const puntosBase = 80
    const bonusPorTareas = tareasCompletadas.length * 20
    const bonusPorColaboracion = colaboracionScore
    const puntosTotal = puntosBase + bonusPorTareas + bonusPorColaboracion

    const nivelColaboracion =
      colaboracionScore >= 100 ? "Excelente" : colaboracionScore >= 60 ? "Buena" : "Satisfactoria"

    const resultado = {
      puntos: puntosTotal,
      colaboracion: nivelColaboracion,
    }

    onComplete(resultado)
  }

  if (challengeData.cargando) {
    return (
      <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-100 to-green-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-800">Preparando desafío colaborativo...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-50 to-green-50 animate-bounce-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Desafío Colaborativo</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(tiempoRestante)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Fase: {fase}
                </Badge>
                <Badge className="bg-blue-500 text-white">Colaboración: {colaboracionScore}%</Badge>
              </CardDescription>
            </div>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Desafío */}
        <div className="p-4 bg-white rounded-lg border-l-4 border-blue-500">
          <h3 className="font-semibold text-blue-800 mb-2">Desafío del Equipo</h3>
          <p className="text-gray-700">{challengeData.pregunta}</p>
        </div>

        {/* Progreso del tiempo */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiempo restante</span>
            <span className="font-mono">{formatTime(tiempoRestante)}</span>
          </div>
          <Progress
            value={((challengeData.tiempoTotal - tiempoRestante) / challengeData.tiempoTotal) * 100}
            className="h-2"
          />
        </div>

        {/* Fase de Formación */}
        {fase === "formacion" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Formación de Equipos</h4>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 mb-4">
                Se necesitan {challengeData.equiposRequeridos} equipos para este desafío. ¡Únete a un equipo!
              </p>
              <Button onClick={formarEquipo} className="bg-blue-500 text-white">
                Unirse al Equipo Alpha
              </Button>
            </div>
          </div>
        )}

        {/* Fase de Planificación */}
        {fase === "planificacion" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Planificación del Proyecto</h4>
            <div className="space-y-3">
              <p className="text-gray-600">Elige tu rol en el equipo:</p>
              {challengeData.tareas.map((tarea, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    rolElegido === tarea
                      ? "bg-blue-100 border-blue-400"
                      : "bg-white border-gray-200 hover:border-blue-300"
                  }`}
                  onClick={() => elegirRol(tarea)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{tarea}</span>
                    {rolElegido === tarea && <Badge className="bg-blue-500 text-white">Seleccionado</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fase de Ejecución */}
        {fase === "ejecucion" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Ejecución del Proyecto</h4>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Tu rol:</strong> {rolElegido}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium text-gray-700">Tareas del equipo:</h5>
              {challengeData.tareas.map((tarea, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    tareasCompletadas.includes(tarea)
                      ? "bg-green-100 border-green-300"
                      : "bg-white border-gray-200 hover:border-green-300 cursor-pointer"
                  }`}
                  onClick={() => completarTarea(tarea)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{tarea}</span>
                    {tareasCompletadas.includes(tarea) ? (
                      <Badge className="bg-green-500 text-white flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Completada
                      </Badge>
                    ) : (
                      <Badge variant="outline">Pendiente</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                💡 <strong>Progreso:</strong> {tareasCompletadas.length}/{challengeData.tareas.length} tareas
                completadas
              </p>
            </div>
          </div>
        )}

        {/* Fase de Presentación */}
        {fase === "presentacion" && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">🎤 Presentación Final</h4>
              <p className="text-purple-700">Tu equipo está presentando la solución al problema...</p>
              <div className="mt-4 space-y-2">
                <div className="text-lg font-semibold">Tareas completadas: {tareasCompletadas.length}</div>
                <div className="text-lg font-semibold">Nivel de colaboración: {colaboracionScore}%</div>
              </div>
            </div>
          </div>
        )}

        {/* Fase de Resultado */}
        {fase === "resultado" && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-4">🏆 Proyecto Completado</h4>
              <div className="space-y-2">
                <div className="text-lg">
                  <strong>Tareas completadas:</strong> {tareasCompletadas.length}/{challengeData.tareas.length}
                </div>
                <div className="text-lg">
                  <strong>Colaboración:</strong>{" "}
                  {colaboracionScore >= 100 ? "Excelente" : colaboracionScore >= 60 ? "Buena" : "Satisfactoria"}
                </div>
                <div className="text-lg">
                  <strong>Resultado:</strong> ¡Trabajo en equipo exitoso!
                </div>
              </div>
              <Button onClick={finalizarDesafio} className="mt-4 bg-green-600 text-white">
                Reclamar Recompensa
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
