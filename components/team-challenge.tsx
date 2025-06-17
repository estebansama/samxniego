"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Users, Target, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface TeamChallengeProps {
  challengeData: {
    pregunta: string
    tareas: string[]
    equiposRequeridos: number
    tiempoTotal: number
  }
  onComplete: (resultado: any) => void
  onClose: () => void
}

export function TeamChallenge({ challengeData, onComplete, onClose }: TeamChallengeProps) {
  const [fase, setFase] = useState<"formacion" | "planificacion" | "ejecucion" | "presentacion" | "resultados">(
    "formacion",
  )
  const [tiempoRestante, setTiempoRestante] = useState(challengeData.tiempoTotal || 600)
  const [equipos, setEquipos] = useState<
    Array<{
      id: number
      nombre: string
      miembros: string[]
      tareasAsignadas: string[]
      progreso: number
      solucion: string
    }>
  >([])
  const [equipoActual, setEquipoActual] = useState(0)
  const [solucionActual, setSolucionActual] = useState("")

  useEffect(() => {
    // Inicializar equipos
    const nuevosEquipos = Array.from({ length: challengeData.equiposRequeridos }, (_, index) => ({
      id: index + 1,
      nombre: `Equipo ${index + 1}`,
      miembros: [`Estudiante ${index * 2 + 1}`, `Estudiante ${index * 2 + 2}`],
      tareasAsignadas: challengeData.tareas.slice(
        index * Math.floor(challengeData.tareas.length / challengeData.equiposRequeridos),
        (index + 1) * Math.floor(challengeData.tareas.length / challengeData.equiposRequeridos),
      ),
      progreso: 0,
      solucion: "",
    }))
    setEquipos(nuevosEquipos)
  }, [challengeData])

  useEffect(() => {
    const timer = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          avanzarFase()
          return challengeData.tiempoTotal || 600
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [fase])

  const avanzarFase = () => {
    const fases = ["formacion", "planificacion", "ejecucion", "presentacion", "resultados"]
    const currentIndex = fases.indexOf(fase)
    if (currentIndex < fases.length - 1) {
      setFase(fases[currentIndex + 1] as any)
      setTiempoRestante(challengeData.tiempoTotal || 600)
    }
  }

  const actualizarProgreso = (equipoId: number, nuevoProgreso: number) => {
    const nuevosEquipos = equipos.map((equipo) =>
      equipo.id === equipoId ? { ...equipo, progreso: Math.min(100, nuevoProgreso) } : equipo,
    )
    setEquipos(nuevosEquipos)
  }

  const guardarSolucion = () => {
    const nuevosEquipos = equipos.map((equipo) =>
      equipo.id === equipos[equipoActual].id ? { ...equipo, solucion: solucionActual } : equipo,
    )
    setEquipos(nuevosEquipos)
    setSolucionActual("")

    if (equipoActual < equipos.length - 1) {
      setEquipoActual(equipoActual + 1)
    } else {
      setFase("resultados")
      calcularResultados()
    }
  }

  const calcularResultados = () => {
    const promedioProgreso = equipos.reduce((acc, eq) => acc + eq.progreso, 0) / equipos.length
    const solucionesCompletas = equipos.filter((eq) => eq.solucion.length > 0).length

    setTimeout(() => {
      onComplete({
        promedioProgreso,
        solucionesCompletas,
        equiposParticipantes: equipos.length,
        puntos: Math.round(promedioProgreso * 0.5 + solucionesCompletas * 20),
        colaboracion: promedioProgreso > 80 ? "Excelente" : promedioProgreso > 60 ? "Buena" : "Necesita mejorar",
      })
    }, 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <Card className="w-full max-w-5xl mx-auto shadow-2xl border-0 bg-gradient-to-r from-blue-50 to-cyan-50">
      <CardHeader className="text-center">
        <div className="flex items-center justify-between mb-4">
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">👥 DESAFÍO DE EQUIPO</Badge>
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

        <CardTitle className="text-xl">{challengeData.pregunta}</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mr-2">
            Fase: {fase}
          </Badge>
          <Badge variant="outline" className="mr-2">
            {equipos.length} equipos
          </Badge>
          Colabora para resolver el desafío
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progreso de la actividad */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso del Desafío</span>
            <span>{["formacion", "planificacion", "ejecucion", "presentacion", "resultados"].indexOf(fase) + 1}/5</span>
          </div>
          <Progress
            value={(["formacion", "planificacion", "ejecucion", "presentacion", "resultados"].indexOf(fase) + 1) * 20}
            className="h-2"
          />
        </div>

        {/* Formación de equipos */}
        {fase === "formacion" && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-center">👥 Formación de Equipos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipos.map((equipo) => (
                <Card key={equipo.id} className="border-2 border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      {equipo.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold">Miembros:</p>
                      {equipo.miembros.map((miembro, index) => (
                        <Badge key={index} variant="outline" className="mr-1">
                          {miembro}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center">
              <Button onClick={avanzarFase} className="bg-primary text-black">
                Comenzar Planificación
              </Button>
            </div>
          </div>
        )}

        {/* Planificación */}
        {fase === "planificacion" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-center">📋 Asignación de Tareas</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Tareas del Proyecto:</h4>
                <div className="space-y-2">
                  {challengeData.tareas.map((tarea, index) => (
                    <div key={index} className="p-3 bg-white rounded border border-gray-200">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{tarea}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Equipos y Asignaciones:</h4>
                <div className="space-y-3">
                  {equipos.map((equipo) => (
                    <Card key={equipo.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <h5 className="font-semibold text-sm mb-2">{equipo.nombre}</h5>
                        <div className="space-y-1">
                          {equipo.tareasAsignadas.map((tarea, index) => (
                            <Badge key={index} variant="secondary" className="mr-1 text-xs">
                              {tarea}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
            <div className="text-center">
              <Button onClick={avanzarFase} className="bg-secondary text-white">
                Iniciar Ejecución
              </Button>
            </div>
          </div>
        )}

        {/* Ejecución */}
        {fase === "ejecucion" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-center">⚡ Ejecución del Proyecto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipos.map((equipo) => (
                <Card key={equipo.id} className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{equipo.nombre}</span>
                      <Badge variant={equipo.progreso === 100 ? "default" : "secondary"}>{equipo.progreso}%</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={equipo.progreso} className="h-2" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => actualizarProgreso(equipo.id, equipo.progreso + 25)}
                        disabled={equipo.progreso >= 100}
                        className="flex-1 text-xs"
                      >
                        +25%
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => actualizarProgreso(equipo.id, 100)}
                        disabled={equipo.progreso >= 100}
                        variant="outline"
                        className="flex-1 text-xs"
                      >
                        Completar
                      </Button>
                    </div>
                    <div className="text-xs text-gray-600">
                      {equipo.progreso === 100 ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          Completado
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertCircle className="h-3 w-3" />
                          En progreso
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {equipos.every((eq) => eq.progreso === 100) && (
              <div className="text-center">
                <Button onClick={avanzarFase} className="bg-green-600 text-white">
                  Proceder a Presentación
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Presentación */}
        {fase === "presentacion" && (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg text-center">🎤 Presentación de Soluciones</h3>
            <div className="text-center mb-4">
              <p className="text-gray-600">
                Turno de: <Badge className="ml-2">{equipos[equipoActual]?.nombre}</Badge>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Presenta tu solución:</label>
                <Textarea
                  placeholder="Describe la solución de tu equipo al desafío..."
                  value={solucionActual}
                  onChange={(e) => setSolucionActual(e.target.value)}
                  className="min-h-32 mt-2"
                />
              </div>

              <Button
                onClick={guardarSolucion}
                disabled={!solucionActual.trim()}
                className="w-full bg-primary text-black"
              >
                {equipoActual < equipos.length - 1 ? "Siguiente Equipo" : "Finalizar Presentaciones"}
              </Button>
            </div>

            {/* Soluciones ya presentadas */}
            {equipos.filter((eq) => eq.solucion).length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Soluciones Presentadas:</h4>
                {equipos
                  .filter((eq) => eq.solucion)
                  .map((equipo) => (
                    <Card key={equipo.id} className="border border-gray-200">
                      <CardContent className="p-4">
                        <h5 className="font-semibold text-sm mb-2">{equipo.nombre}</h5>
                        <p className="text-sm text-gray-700">{equipo.solucion}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Resultados */}
        {fase === "resultados" && (
          <div className="space-y-6 text-center">
            <div className="p-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg">
              <Users className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="font-bold text-xl text-gray-800">¡Desafío Completado!</h3>
              <p className="text-gray-700 mt-2">Excelente trabajo en equipo</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {equipos.reduce((acc, eq) => acc + eq.progreso, 0) / equipos.length}%
                </div>
                <div className="text-xs text-gray-600">Progreso Promedio</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {equipos.filter((eq) => eq.solucion.length > 0).length}
                </div>
                <div className="text-xs text-gray-600">Soluciones</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{equipos.length}</div>
                <div className="text-xs text-gray-600">Equipos</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +
                  {Math.round(
                    (equipos.reduce((acc, eq) => acc + eq.progreso, 0) / equipos.length) * 0.5 +
                      equipos.filter((eq) => eq.solucion.length > 0).length * 20,
                  )}
                </div>
                <div className="text-xs text-gray-600">Puntos</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
