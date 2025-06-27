"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Star, Gamepad2, Brain, Palette, Target, Award, MessageSquare, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { DebateSession } from "@/components/debate-session"
import { TeamChallenge } from "@/components/team-challenge"

export default function AlumnoPage() {
  const [user, setUser] = useState(null)
  const [puntos, setPuntos] = useState(1250)
  const [nivel, setNivel] = useState(8)
  const [minijuegos, setMinijuegos] = useState([])
  const [logros, setLogros] = useState([])
  const [juegoActivo, setJuegoActivo] = useState(null)
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null)
  const [debateActivo, setDebateActivo] = useState(null)
  const [equipoActivo, setEquipoActivo] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("clasio_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))

    // Simular minijuegos disponibles
    setMinijuegos([
      {
        id: 1,
        titulo: "Trivia de Historia",
        tipo: "trivia",
        arquetipo: "analítico",
        puntos: 50,
        dificultad: "Medio",
        materia: "Historia",
        disponible: true,
      },
      {
        id: 2,
        titulo: "Memoria Matemática",
        tipo: "memoria",
        arquetipo: "gamer",
        puntos: 75,
        dificultad: "Fácil",
        materia: "Matemáticas",
        disponible: true,
      },
      {
        id: 3,
        titulo: "Debate: Tecnología en Educación",
        tipo: "debate",
        arquetipo: "debatidor",
        puntos: 100,
        dificultad: "Difícil",
        materia: "Literatura",
        disponible: true,
      },
      {
        id: 4,
        titulo: "Proyecto Colaborativo: Ciudad Sostenible",
        tipo: "equipo",
        arquetipo: "colaborativo",
        puntos: 120,
        dificultad: "Medio",
        materia: "Ciencias",
        disponible: true,
      },
    ])

    // Simular logros
    setLogros([
      { id: 1, nombre: "Primera Victoria", descripcion: "Completa tu primer minijuego", obtenido: true },
      { id: 2, nombre: "Racha de 5", descripcion: "Responde 5 preguntas seguidas correctamente", obtenido: true },
      { id: 3, nombre: "Explorador", descripcion: "Juega minijuegos de 3 materias diferentes", obtenido: false },
      { id: 4, nombre: "Maestro", descripcion: "Alcanza 2000 puntos", obtenido: false },
    ])
  }, [router])

  const iniciarJuego = async (minijuego) => {
    try {
      if (minijuego.tipo === "debate") {
        // Handle debate games
        setDebateActivo({
          titulo: "🎭 Generando tema de debate...",
          pregunta: "Preparando sesión de debate...",
          argumentos: [],
          cargando: true,
        })

        try {
          const response = await fetch(
            `/api/minijuego?arquetipo=debatidor&materia=${minijuego.materia}&tema=${minijuego.titulo}&dificultad=debate`,
          )
          const data = await response.json()

          if (data.success) {
            setDebateActivo({
              pregunta: data.pregunta,
              argumentos: data.argumentos || [
                "Argumento a favor basado en evidencia educativa",
                "Argumento en contra considerando limitaciones y riesgos",
              ],
              tiempoTotal: data.tiempoSugerido || 300,
              cargando: false,
            })
          } else {
            throw new Error("Error en la respuesta del servidor")
          }
        } catch (error) {
          console.error("Error generando debate:", error)
          // Fallback para debates
          setDebateActivo({
            pregunta: `🏛️ DEBATE: ¿La tecnología mejora o perjudica el aprendizaje en ${minijuego.materia}?`,
            argumentos: [
              `A favor: La tecnología hace ${minijuego.materia} más accesible e interactiva`,
              `En contra: La tecnología puede distraer del aprendizaje profundo en ${minijuego.materia}`,
            ],
            tiempoTotal: 300,
            cargando: false,
          })
        }
      } else if (minijuego.tipo === "equipo") {
        // Handle team games
        setEquipoActivo({
          titulo: "👥 Preparando desafío de equipo...",
          pregunta: "Organizando trabajo colaborativo...",
          tareas: [],
          cargando: true,
        })

        try {
          const response = await fetch(
            `/api/minijuego?arquetipo=colaborativo&materia=${minijuego.materia}&tema=${minijuego.titulo}&dificultad=equipo`,
          )
          const data = await response.json()

          if (data.success) {
            setEquipoActivo({
              pregunta: data.pregunta,
              tareas: data.tareas || [
                "Investigador: Analizar el problema desde múltiples ángulos",
                "Diseñador: Proponer soluciones creativas e innovadoras",
                "Evaluador: Analizar viabilidad y efectividad de propuestas",
                "Comunicador: Preparar presentación clara y convincente",
              ],
              equiposRequeridos: data.equiposRequeridos || 3,
              tiempoTotal: data.tiempoSugerido || 600,
              cargando: false,
            })
          } else {
            throw new Error("Error en la respuesta del servidor")
          }
        } catch (error) {
          console.error("Error generando desafío de equipo:", error)
          // Fallback para trabajo en equipo
          setEquipoActivo({
            pregunta: `👥 PROYECTO COLABORATIVO: Diseñen una solución innovadora para un problema de ${minijuego.materia}`,
            tareas: [
              "Investigador: Analizar el problema desde múltiples ángulos",
              "Diseñador: Proponer soluciones creativas e innovadoras",
              "Evaluador: Analizar viabilidad y efectividad de propuestas",
              "Comunicador: Preparar presentación clara y convincente",
            ],
            equiposRequeridos: 3,
            tiempoTotal: 600,
            cargando: false,
          })
        }
      } else {
        // Handle regular trivia games (existing logic)
        setJuegoActivo({
          titulo: "🤖 Generando pregunta personalizada...",
          pregunta: "Analizando tu perfil de aprendizaje...",
          opciones: [],
          cargando: true,
        })

        try {
          const response = await fetch(
            `/api/minijuego?arquetipo=gamer&materia=${minijuego.materia}&tema=${minijuego.titulo}&dificultad=medio`,
          )
          const data = await response.json()

          if (data.success) {
            setJuegoActivo({
              ...data,
              cargando: false,
            })
          } else {
            throw new Error("Error en la respuesta del servidor")
          }
        } catch (error) {
          console.error("Error generando trivia:", error)
          setJuegoActivo({
            titulo: "🎮 Pregunta de Práctica",
            pregunta: `¿Cuál es un concepto importante en ${minijuego.materia}?`,
            opciones: [
              "Concepto fundamental de la materia",
              "Información secundaria",
              "Datos no relacionados",
              "Contenido opcional",
            ],
            respuestaCorrecta: "Concepto fundamental de la materia",
            explicacion: `Este concepto es esencial para comprender ${minijuego.materia}.`,
            puntaje: 25,
            cargando: false,
            error: false,
            nota: "🤖 Pregunta de práctica - API temporalmente no disponible",
          })
        }
      }
    } catch (error) {
      console.error("Error general:", error)
      // Fallback general
      setJuegoActivo({
        titulo: "Error de Conexión",
        pregunta: "No se pudo conectar con el servidor. Por favor intenta nuevamente.",
        opciones: [],
        error: true,
        cargando: false,
      })
    }
  }

  const responderPregunta = async (respuesta) => {
    setRespuestaSeleccionada(respuesta)

    // Simular verificación
    setTimeout(() => {
      const esCorrecta = respuesta === juegoActivo.respuestaCorrecta
      if (esCorrecta) {
        setPuntos((prev) => prev + 25)
        // Actualizar puntos en el servidor
        fetch("/api/puntos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ puntos: 25, tipo: "respuesta_correcta" }),
        })
      }

      setTimeout(() => {
        setJuegoActivo(null)
        setRespuestaSeleccionada(null)
      }, 2000)
    }, 1000)
  }

  const completarDebate = (resultado) => {
    setPuntos((prev) => prev + resultado.puntos)
    // Update points on server
    fetch("/api/puntos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puntos: resultado.puntos,
        tipo: "debate_completado",
        descripcion: `Debate completado - ${resultado.ganador}`,
      }),
    })
    setDebateActivo(null)
  }

  const completarEquipo = (resultado) => {
    setPuntos((prev) => prev + resultado.puntos)
    // Update points on server
    fetch("/api/puntos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puntos: resultado.puntos,
        tipo: "trabajo_equipo",
        descripcion: `Proyecto colaborativo - ${resultado.colaboracion}`,
      }),
    })
    setEquipoActivo(null)
  }

  const getArquetipoIcon = (arquetipo) => {
    switch (arquetipo) {
      case "gamer":
        return Gamepad2
      case "creativo":
        return Palette
      case "analítico":
        return Brain
      case "debatidor":
        return MessageSquare
      case "colaborativo":
        return Users
      default:
        return Target
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header del Alumno */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img
              src="https://edu8uatvnzt2gwze.public.blob.vercel-storage.com/clasio-logo-JlTBTWFZiiSJdBi1ydgbVheAJPlfgR.png"
              alt="Clasio Logo"
              className="h-12 w-auto"
              onError={(e) => {
                // Fallback to CSS logo if image fails to load
                e.target.style.display = "none"
                e.target.nextElementSibling.style.display = "flex"
              }}
            />
            <div
              className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg"
              style={{ display: "none" }}
            >
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">¡Hola, {user?.nombre || "Estudiante"}!</h1>
              <p className="text-gray-600">
                Nivel {nivel} • {puntos} puntos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => router.push("/votaciones")} className="bg-secondary text-white">
              🗳️ Votaciones
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black"
            >
              Salir
            </Button>
          </div>
        </div>

        {/* Juego Activo */}
        {juegoActivo && (
          <Card className="shadow-2xl border-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-bounce-in">
            <CardHeader className="text-center">
              {juegoActivo.cargando ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <CardTitle className="text-xl">{juegoActivo.titulo}</CardTitle>
                </div>
              ) : (
                <>
                  <CardTitle className="text-2xl">{juegoActivo.pregunta}</CardTitle>
                  <CardDescription className="flex items-center justify-center gap-4">
                    {juegoActivo.generadoPorIA && (
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">🧠 Pregunta IA</Badge>
                    )}
                    {juegoActivo.habilidadCognitiva && (
                      <Badge variant="outline">🎯 {juegoActivo.habilidadCognitiva}</Badge>
                    )}
                    {juegoActivo.tiempoSugerido && <Badge variant="outline">⏱️ {juegoActivo.tiempoSugerido}s</Badge>}
                  </CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {juegoActivo.cargando ? (
                <div className="text-center p-8">
                  <p className="text-gray-600">Creando una pregunta perfecta para tu estilo de aprendizaje...</p>
                </div>
              ) : juegoActivo.error ? (
                <div className="text-center p-4">
                  <Button onClick={() => setJuegoActivo(null)} className="bg-primary text-black">
                    Cerrar
                  </Button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {juegoActivo.opciones.map((opcion, index) => (
                      <Button
                        key={index}
                        onClick={() => responderPregunta(opcion)}
                        disabled={respuestaSeleccionada !== null}
                        className={`h-16 text-left justify-start p-4 ${
                          respuestaSeleccionada === opcion
                            ? opcion === juegoActivo.respuestaCorrecta
                              ? "bg-green-500 text-white"
                              : "bg-red-500 text-white"
                            : "bg-white hover:bg-primary/10 text-gray-800 border-2 border-gray-200"
                        }`}
                      >
                        <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                        {opcion}
                      </Button>
                    ))}
                  </div>
                  {respuestaSeleccionada && (
                    <div className="text-center mt-6">
                      {respuestaSeleccionada === juegoActivo.respuestaCorrecta ? (
                        <div className="space-y-2">
                          <div className="text-green-600 font-bold text-xl animate-bounce-in">
                            🎉 ¡Correcto! +{juegoActivo.puntaje || 25} puntos
                          </div>
                          {juegoActivo.explicacion && (
                            <div className="p-3 bg-green-50 rounded-lg text-green-800 text-sm">
                              💡 {juegoActivo.explicacion}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-red-600 font-bold text-xl">
                            ❌ Incorrecto. La respuesta era: {juegoActivo.respuestaCorrecta}
                          </div>
                          {juegoActivo.explicacion && (
                            <div className="p-3 bg-red-50 rounded-lg text-red-800 text-sm">
                              💡 {juegoActivo.explicacion}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Debate Activo */}
        {debateActivo && (
          <DebateSession debateData={debateActivo} onComplete={completarDebate} onClose={() => setDebateActivo(null)} />
        )}

        {/* Equipo Activo */}
        {equipoActivo && (
          <TeamChallenge
            challengeData={equipoActivo}
            onComplete={completarEquipo}
            onClose={() => setEquipoActivo(null)}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Minijuegos Disponibles */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Minijuegos Disponibles
                </CardTitle>
                <CardDescription>Juegos adaptados a tu estilo de aprendizaje</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {minijuegos.map((juego) => {
                    const IconComponent = getArquetipoIcon(juego.arquetipo)
                    return (
                      <div
                        key={juego.id}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          juego.disponible
                            ? "border-primary/30 bg-primary/5 hover:border-primary hover:shadow-lg"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{juego.titulo}</h3>
                              <p className="text-sm text-gray-600">{juego.materia}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline">{juego.puntos} pts</Badge>
                            <Badge
                              variant={
                                juego.dificultad === "Fácil"
                                  ? "default"
                                  : juego.dificultad === "Medio"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {juego.dificultad}
                            </Badge>
                            <Button
                              onClick={() => iniciarJuego(juego)}
                              disabled={!juego.disponible}
                              size="sm"
                              className="bg-primary text-black hover:bg-primary/90"
                            >
                              Jugar
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Progreso */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="h-5 w-5 text-primary" />
                  Tu Progreso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Nivel {nivel}</span>
                    <span className="text-sm text-gray-600">{puntos}/1500 pts</span>
                  </div>
                  <Progress value={((puntos % 1500) / 1500) * 100} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{puntos}</div>
                    <div className="text-xs text-gray-600">Puntos Totales</div>
                  </div>
                  <div className="text-center p-3 bg-secondary/10 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{nivel}</div>
                    <div className="text-xs text-gray-600">Nivel Actual</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Logros */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trophy className="h-5 w-5 text-primary" />
                  Logros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {logros.map((logro) => (
                  <div
                    key={logro.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      logro.obtenido ? "bg-primary/10" : "bg-gray-50"
                    }`}
                  >
                    <Award className={`h-5 w-5 ${logro.obtenido ? "text-primary" : "text-gray-400"}`} />
                    <div className="flex-1">
                      <div className={`font-medium ${logro.obtenido ? "text-gray-800" : "text-gray-500"}`}>
                        {logro.nombre}
                      </div>
                      <div className="text-xs text-gray-600">{logro.descripcion}</div>
                    </div>
                    {logro.obtenido && (
                      <Badge variant="default" className="bg-primary text-black">
                        ✓
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
