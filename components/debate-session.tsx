"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MessageSquare, Clock, Users, Trophy, X } from "lucide-react"

interface DebateSessionProps {
  debateData: {
    pregunta: string
    argumentos: string[]
    tiempoTotal: number
    cargando?: boolean
  }
  onComplete: (resultado: { puntos: number; ganador: string }) => void
  onClose: () => void
}

export function DebateSession({ debateData, onComplete, onClose }: DebateSessionProps) {
  const [tiempoRestante, setTiempoRestante] = useState(debateData.tiempoTotal || 300)
  const [fase, setFase] = useState<"preparacion" | "debate" | "votacion" | "resultado">("preparacion")
  const [posicionElegida, setPosicionElegida] = useState<"favor" | "contra" | null>(null)
  const [argumentosUsados, setArgumentosUsados] = useState<string[]>([])
  const [votosRecibidos, setVotosRecibidos] = useState(0)

  useEffect(() => {
    if (debateData.cargando) return

    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          if (fase === "preparacion") {
            setFase("debate")
            return 180 // 3 minutos para debate
          } else if (fase === "debate") {
            setFase("votacion")
            return 60 // 1 minuto para votación
          } else if (fase === "votacion") {
            setFase("resultado")
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fase, debateData.cargando])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const elegirPosicion = (posicion: "favor" | "contra") => {
    setPosicionElegida(posicion)
    setFase("debate")
    setTiempoRestante(180)
  }

  const usarArgumento = (argumento: string) => {
    if (!argumentosUsados.includes(argumento)) {
      setArgumentosUsados([...argumentosUsados, argumento])
      // Simular recepción de votos
      setVotosRecibidos((prev) => prev + Math.floor(Math.random() * 3) + 1)
    }
  }

  const finalizarDebate = () => {
    const puntosBase = 50
    const bonusPorArgumentos = argumentosUsados.length * 15
    const bonusPorVotos = votosRecibidos * 5
    const puntosTotal = puntosBase + bonusPorArgumentos + bonusPorVotos

    const resultado = {
      puntos: puntosTotal,
      ganador: votosRecibidos >= 5 ? "Ganaste el debate" : "Participación exitosa",
    }

    onComplete(resultado)
  }

  if (debateData.cargando) {
    return (
      <Card className="shadow-2xl border-0 bg-gradient-to-r from-purple-100 to-blue-100">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-800">Preparando sesión de debate...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-2xl border-0 bg-gradient-to-r from-purple-50 to-blue-50 animate-bounce-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Sesión de Debate</CardTitle>
              <CardDescription className="flex items-center gap-4 mt-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(tiempoRestante)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Fase: {fase}
                </Badge>
                {votosRecibidos > 0 && (
                  <Badge className="bg-green-500 text-white flex items-center gap-1">
                    <Trophy className="h-3 w-3" />
                    {votosRecibidos} votos
                  </Badge>
                )}
              </CardDescription>
            </div>
          </div>
          <Button onClick={onClose} variant="outline" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Pregunta del Debate */}
        <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500">
          <h3 className="font-semibold text-purple-800 mb-2">Tema de Debate</h3>
          <p className="text-gray-700">{debateData.pregunta}</p>
        </div>

        {/* Progreso del tiempo */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiempo restante</span>
            <span className="font-mono">{formatTime(tiempoRestante)}</span>
          </div>
          <Progress
            value={((debateData.tiempoTotal - tiempoRestante) / debateData.tiempoTotal) * 100}
            className="h-2"
          />
        </div>

        {/* Fase de Preparación */}
        {fase === "preparacion" && (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Elige tu posición:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => elegirPosicion("favor")}
                className="h-auto p-4 bg-green-100 hover:bg-green-200 text-green-800 border-2 border-green-300"
              >
                <div className="text-left">
                  <div className="font-semibold mb-2">✅ A Favor</div>
                  <div className="text-sm">{debateData.argumentos[0]}</div>
                </div>
              </Button>
              <Button
                onClick={() => elegirPosicion("contra")}
                className="h-auto p-4 bg-red-100 hover:bg-red-200 text-red-800 border-2 border-red-300"
              >
                <div className="text-left">
                  <div className="font-semibold mb-2">❌ En Contra</div>
                  <div className="text-sm">{debateData.argumentos[1]}</div>
                </div>
              </Button>
            </div>
          </div>
        )}

        {/* Fase de Debate */}
        {fase === "debate" && posicionElegida && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className={posicionElegida === "favor" ? "bg-green-500" : "bg-red-500"}>
                {posicionElegida === "favor" ? "Defendiendo: A Favor" : "Defendiendo: En Contra"}
              </Badge>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Argumentos disponibles:</h4>
              {debateData.argumentos.map((argumento, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    argumentosUsados.includes(argumento)
                      ? "bg-gray-100 border-gray-300 opacity-60"
                      : "bg-white border-purple-200 hover:border-purple-400 cursor-pointer"
                  }`}
                  onClick={() => usarArgumento(argumento)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{argumento}</span>
                    {argumentosUsados.includes(argumento) ? (
                      <Badge variant="outline">Usado ✓</Badge>
                    ) : (
                      <Badge className="bg-purple-500 text-white">Usar</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Usa diferentes argumentos para ganar más votos de la audiencia
              </p>
            </div>
          </div>
        )}

        {/* Fase de Votación */}
        {fase === "votacion" && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">🗳️ Votación en Curso</h4>
              <p className="text-yellow-700">La audiencia está votando por los mejores argumentos...</p>
              <div className="mt-4">
                <div className="text-2xl font-bold text-yellow-800">{votosRecibidos}</div>
                <div className="text-sm text-yellow-600">Votos recibidos</div>
              </div>
            </div>
          </div>
        )}

        {/* Fase de Resultado */}
        {fase === "resultado" && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-4">🏆 Debate Finalizado</h4>
              <div className="space-y-2">
                <div className="text-lg">
                  <strong>Argumentos usados:</strong> {argumentosUsados.length}
                </div>
                <div className="text-lg">
                  <strong>Votos recibidos:</strong> {votosRecibidos}
                </div>
                <div className="text-lg">
                  <strong>Resultado:</strong>{" "}
                  {votosRecibidos >= 5 ? "¡Ganaste el debate!" : "¡Excelente participación!"}
                </div>
              </div>
              <Button onClick={finalizarDebate} className="mt-4 bg-green-600 text-white">
                Reclamar Recompensa
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
