"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Clock, Award, ThumbsUp, ThumbsDown } from "lucide-react"

interface DebateSessionProps {
  debateData: {
    pregunta: string
    argumentos: string[]
    tiempoTotal: number
    equiposRequeridos?: number
  }
  onComplete: (resultado: any) => void
  onClose: () => void
}

export function DebateSession({ debateData, onComplete, onClose }: DebateSessionProps) {
  const [fase, setFase] = useState<"preparacion" | "argumentos" | "contraargumentos" | "votacion" | "resultados">(
    "preparacion",
  )
  const [tiempoRestante, setTiempoRestante] = useState(debateData.tiempoTotal || 300)
  const [equipos, setEquipos] = useState<
    Array<{
      id: number
      nombre: string
      posicion: "favor" | "contra"
      argumentos: string[]
      votos: number
    }>
  >([])
  const [argumentoActual, setArgumentoActual] = useState("")
  const [equipoActivo, setEquipoActivo] = useState(0)
  const [votacionCompleta, setVotacionCompleta] = useState(false)

  useEffect(() => {
    // Inicializar equipos
    setEquipos([
      {
        id: 1,
        nombre: "Equipo A Favor",
        posicion: "favor",
        argumentos: [],
        votos: 0,
      },
      {
        id: 2,
        nombre: "Equipo En Contra",
        posicion: "contra",
        argumentos: [],
        votos: 0,
      },
    ])
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          avanzarFase()
          return debateData.tiempoTotal || 300
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fase])

  const avanzarFase = () => {
    const fases = ["preparacion", "argumentos", "contraargumentos", "votacion", "resultados"]
    const currentIndex = fases.indexOf(fase)
    if (currentIndex < fases.length - 1) {
      setFase(fases[currentIndex + 1] as any)
      setTiempoRestante(debateData.tiempoTotal || 300)
    }
  }

  const agregarArgumento = () => {
    if (!argumentoActual.trim()) return

    const nuevosEquipos = [...equipos]
    nuevosEquipos[equipoActivo].argumentos.push(argumentoActual)
    setEquipos(nuevosEquipos)
    setArgumentoActual("")

    // Cambiar al siguiente equipo
    setEquipoActivo((prev) => (prev + 1) % equipos.length)
  }

  const votar = (equipoId: number) => {
    const nuevosEquipos = equipos.map((equipo) =>
      equipo.id === equipoId ? { ...equipo, votos: equipo.votos + 1 } : equipo,
    )
    setEquipos(nuevosEquipos)
    setVotacionCompleta(true)

    setTimeout(() => {
      setFase("resultados")
      const ganador = nuevosEquipos.reduce((a, b) => (a.votos > b.votos ? a : b))
      onComplete({
        ganador: ganador.nombre,
        argumentosTotal: nuevosEquipos.reduce((acc, eq) => acc + eq.argumentos.length, 0),
        participacion: 100,
        puntos: 50 + ganador.argumentos.length * 10,
      })
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-0 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">🎭 SESIÓN DE DEBATE</Badge>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="font-mono text-lg">{formatTime(tiempoRestante)}</span>
            </div>
            <Button onClick={onClose} variant="outline" size="sm">
              Cerrar
            </Button>
          </div>
        </div>

        <CardTitle className="text-xl">{debateData.pregunta}</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mr-2">
            Fase: {fase}
          </Badge>
          Argumenta tu posición y escucha otros puntos de vista
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progreso de la sesión */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso del Debate</span>
            <span>
              {["preparacion", "argumentos", "contraargumentos", "votacion", "resultados"].indexOf(fase) + 1}/5
            </span>
          </div>
          <Progress
            value={(["preparacion", "argumentos", "contraargumentos", "votacion", "resultados"].indexOf(fase) + 1) * 20}
            className="h-2"
          />
        </div>

        {/* Argumentos base */}
        {fase === "preparacion" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">📋 Argumentos Base para Considerar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debateData.argumentos?.map((argumento, index) => (
                <div key={index} className="p-4 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">{argumento}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button onClick={avanzarFase} className="bg-primary text-black">
                Comenzar Debate
              </Button>
            </div>
          </div>
        )}

        {/* Fase de argumentos */}
        {(fase === "argumentos" || fase === "contraargumentos") && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {fase === "argumentos" ? "💬 Presenta tus Argumentos" : "🔄 Contraargumentos"}
              </h3>
              <p className="text-sm text-gray-600">
                Turno del: <Badge className="ml-2">{equipos[equipoActivo]?.nombre}</Badge>
              </p>
            </div>

            <div className="space-y-4">
              <Textarea
                placeholder={`Escribe tu ${fase === "argumentos" ? "argumento" : "contraargumento"} aquí...`}
                value={argumentoActual}
                onChange={(e) => setArgumentoActual(e.target.value)}
                className="min-h-24"
              />
              <Button
                onClick={agregarArgumento}
                disabled={!argumentoActual.trim()}
                className="w-full bg-secondary text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar {fase === "argumentos" ? "Argumento" : "Contraargumento"}
              </Button>
            </div>

            {/* Argumentos de equipos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipos.map((equipo) => (
                <Card
                  key={equipo.id}
                  className={`border-2 ${equipo.posicion === "favor" ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {equipo.posicion === "favor" ? (
                        <ThumbsUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-600" />
                      )}
                      {equipo.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {equipo.argumentos.map((arg, index) => (
                      <div key={index} className="p-2 bg-white rounded text-xs">
                        {arg}
                      </div>
                    ))}
                    {equipo.argumentos.length === 0 && (
                      <p className="text-xs text-gray-500 italic">Esperando argumentos...</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Fase de votación */}
        {fase === "votacion" && !votacionCompleta && (
          <div className="space-y-6 text-center">
            <h3 className="font-semibold text-lg">🗳️ Vota por el Mejor Argumento</h3>
            <p className="text-gray-600">¿Qué equipo presentó los argumentos más convincentes?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipos.map((equipo) => (
                <Button
                  key={equipo.id}
                  onClick={() => votar(equipo.id)}
                  className={`h-auto p-6 ${
                    equipo.posicion === "favor"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {equipo.posicion === "favor" ? (
                        <ThumbsUp className="h-5 w-5" />
                      ) : (
                        <ThumbsDown className="h-5 w-5" />
                      )}
                      <span className="font-semibold">{equipo.nombre}</span>
                    </div>
                    <p className="text-sm opacity-90">{equipo.argumentos.length} argumentos presentados</p>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        {fase === "resultados" && (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
              <Award className="h-12 w-12 mx-auto mb-4 text-yellow-600" />
              <h3 className="font-bold text-xl text-gray-800">¡Debate Completado!</h3>
              <p className="text-gray-700 mt-2">
                Ganador:{" "}
                <Badge className="ml-2 bg-yellow-500 text-white">
                  {equipos.reduce((a, b) => (a.votos > b.votos ? a : b)).nombre}
                </Badge>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {equipos.reduce((acc, eq) => acc + eq.argumentos.length, 0)}
                </div>
                <div className="text-xs text-gray-600">Argumentos Totales</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">100%</div>
                <div className="text-xs text-gray-600">Participación</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +{50 + equipos.reduce((a, b) => (a.votos > b.votos ? a : b)).argumentos.length * 10}
                </div>
                <div className="text-xs text-gray-600">Puntos Ganados</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
