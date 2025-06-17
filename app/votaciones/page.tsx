"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Vote, Plus, TrendingUp, Users, Clock, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VotacionesPage() {
  const [user, setUser] = useState(null)
  const [puntos, setPuntos] = useState(1250)
  const [propuestas, setPropuestas] = useState([])
  const [nuevaPropuesta, setNuevaPropuesta] = useState({ titulo: "", descripcion: "" })
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("clasio_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
    cargarPropuestas()
  }, [router])

  const cargarPropuestas = async () => {
    try {
      const response = await fetch("/api/votacion")
      const data = await response.json()
      setPropuestas(data.propuestas || [])
    } catch (error) {
      console.error("Error cargando propuestas:", error)
      // Datos simulados
      setPropuestas([
        {
          id: 1,
          titulo: "Recreos más largos",
          descripcion: "Propongo que los recreos duren 20 minutos en lugar de 15",
          autor: "Ana García",
          votos: 45,
          totalVotos: 120,
          costoPuntos: 50,
          estado: "activa",
          fechaCreacion: "2024-01-15",
          yaVote: false,
        },
        {
          id: 2,
          titulo: "Clases de programación",
          descripcion: "Incluir clases opcionales de programación y desarrollo web",
          autor: "Carlos López",
          votos: 78,
          totalVotos: 120,
          costoPuntos: 75,
          estado: "activa",
          fechaCreacion: "2024-01-14",
          yaVote: true,
        },
        {
          id: 3,
          titulo: "Cafetería saludable",
          descripcion: "Más opciones de comida saludable en la cafetería escolar",
          autor: "María Rodríguez",
          votos: 92,
          totalVotos: 120,
          costoPuntos: 60,
          estado: "aprobada",
          fechaCreacion: "2024-01-10",
          yaVote: true,
        },
      ])
    }
  }

  const crearPropuesta = async () => {
    if (!nuevaPropuesta.titulo || !nuevaPropuesta.descripcion) return

    const costoPuntos = 100 // Costo fijo para crear propuesta
    if (puntos < costoPuntos) {
      alert("No tienes suficientes puntos para crear una propuesta")
      return
    }

    try {
      const response = await fetch("/api/votacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevaPropuesta,
          autor: user?.nombre || "Estudiante",
          costoPuntos,
        }),
      })

      if (response.ok) {
        setPuntos((prev) => prev - costoPuntos)
        setNuevaPropuesta({ titulo: "", descripcion: "" })
        setMostrarFormulario(false)
        cargarPropuestas()
      }
    } catch (error) {
      console.error("Error creando propuesta:", error)
    }
  }

  const votar = async (propuestaId, costoPuntos) => {
    if (puntos < costoPuntos) {
      alert("No tienes suficientes puntos para votar")
      return
    }

    try {
      const response = await fetch("/api/votacion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accion: "votar",
          propuestaId,
          costoPuntos,
        }),
      })

      if (response.ok) {
        setPuntos((prev) => prev - costoPuntos)
        cargarPropuestas()
      }
    } catch (error) {
      console.error("Error votando:", error)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case "activa":
        return "bg-primary text-black"
      case "aprobada":
        return "bg-green-500 text-white"
      case "rechazada":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push("/alumno")}
              variant="outline"
              size="sm"
              className="border-2 border-primary text-primary hover:bg-primary hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <img src="/clasio-logo.png" alt="Clasio Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Sistema de Votaciones</h1>
              <p className="text-gray-600">Propón ideas y vota por las mejores</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{puntos}</div>
              <div className="text-sm text-gray-600">Puntos disponibles</div>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Vote className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">{propuestas.length}</div>
                  <div className="text-sm text-gray-600">Propuestas Activas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">120</div>
                  <div className="text-sm text-gray-600">Estudiantes Participando</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">3</div>
                  <div className="text-sm text-gray-600">Propuestas Aprobadas</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Lista de Propuestas */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Propuestas Estudiantiles</h2>
              <Button
                onClick={() => setMostrarFormulario(!mostrarFormulario)}
                className="bg-gradient-to-r from-primary to-secondary text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Propuesta
              </Button>
            </div>

            {/* Formulario Nueva Propuesta */}
            {mostrarFormulario && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur animate-slide-up">
                <CardHeader>
                  <CardTitle>Crear Nueva Propuesta</CardTitle>
                  <CardDescription>
                    Costo: 100 puntos • Las propuestas son revisadas antes de publicarse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Título de la propuesta"
                    value={nuevaPropuesta.titulo}
                    onChange={(e) => setNuevaPropuesta((prev) => ({ ...prev, titulo: e.target.value }))}
                    className="border-2 border-gray-200 focus:border-primary"
                  />
                  <Textarea
                    placeholder="Describe tu propuesta en detalle..."
                    value={nuevaPropuesta.descripcion}
                    onChange={(e) => setNuevaPropuesta((prev) => ({ ...prev, descripcion: e.target.value }))}
                    className="min-h-24 border-2 border-gray-200 focus:border-primary"
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={crearPropuesta}
                      disabled={!nuevaPropuesta.titulo || !nuevaPropuesta.descripcion || puntos < 100}
                      className="bg-primary text-black hover:bg-primary/90"
                    >
                      Crear Propuesta (-100 pts)
                    </Button>
                    <Button onClick={() => setMostrarFormulario(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Propuestas */}
            <div className="space-y-4">
              {propuestas.map((propuesta) => (
                <Card key={propuesta.id} className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{propuesta.titulo}</CardTitle>
                        <CardDescription className="mt-2">
                          Por {propuesta.autor} • {propuesta.fechaCreacion}
                        </CardDescription>
                      </div>
                      <Badge className={getEstadoColor(propuesta.estado)}>
                        {propuesta.estado.charAt(0).toUpperCase() + propuesta.estado.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">{propuesta.descripcion}</p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Progreso de Votación</span>
                        <span className="text-sm text-gray-600">
                          {propuesta.votos}/{propuesta.totalVotos} votos
                        </span>
                      </div>
                      <Progress value={(propuesta.votos / propuesta.totalVotos) * 100} className="h-2" />
                    </div>

                    {propuesta.estado === "activa" && (
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Costo: {propuesta.costoPuntos} puntos</span>
                        </div>
                        <Button
                          onClick={() => votar(propuesta.id, propuesta.costoPuntos)}
                          disabled={propuesta.yaVote || puntos < propuesta.costoPuntos}
                          size="sm"
                          className={`${
                            propuesta.yaVote
                              ? "bg-gray-400 text-white cursor-not-allowed"
                              : "bg-secondary text-white hover:bg-secondary/90"
                          }`}
                        >
                          {propuesta.yaVote ? "Ya Votaste" : `Votar (-${propuesta.costoPuntos} pts)`}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Mis Puntos */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Mis Puntos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-primary/10 rounded-xl">
                  <div className="text-3xl font-bold text-primary">{puntos}</div>
                  <div className="text-sm text-gray-600">Puntos Disponibles</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Crear propuesta:</span>
                    <span className="font-medium">100 pts</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Votar propuesta:</span>
                    <span className="font-medium">50-75 pts</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg">
                  💡 Gana más puntos participando en clases y completando minijuegos
                </div>
              </CardContent>
            </Card>

            {/* Historial de Votaciones */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg">Historial Reciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { accion: "Votaste por", propuesta: "Clases de programación", puntos: -75, fecha: "Hace 2 días" },
                  { accion: "Creaste", propuesta: "Biblioteca digital", puntos: -100, fecha: "Hace 1 semana" },
                  { accion: "Votaste por", propuesta: "Cafetería saludable", puntos: -60, fecha: "Hace 2 semanas" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{item.accion}</div>
                      <div className="text-xs text-gray-600">{item.propuesta}</div>
                      <div className="text-xs text-gray-500">{item.fecha}</div>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      {item.puntos}
                    </Badge>
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
