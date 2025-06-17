"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"
import { TrendingUp, Clock, Award, Eye, MessageSquare, Brain } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PadrePage() {
  const [user, setUser] = useState(null)
  const [informe, setInforme] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("clasio_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
    cargarInforme()
  }, [router])

  const cargarInforme = async () => {
    try {
      // Primero intentar generar informe con IA
      const datosEstudiante = {
        nombre: "Juan Estudiante",
        curso: "3°A",
        materias: ["Matemáticas", "Historia", "Literatura", "Ciencias"],
        rendimiento: {
          atencionPromedio: 88,
          participacionPromedio: 85,
          puntosGanados: 1250,
          diasAsistencia: 5,
          totalDias: 5,
        },
        actividades: [
          { tipo: "trivia", materia: "Historia", resultado: "completado", puntos: 75 },
          { tipo: "ejercicios", materia: "Matemáticas", resultado: "completado", puntos: 100 },
          { tipo: "memoria", materia: "Literatura", resultado: "completado", puntos: 85 },
        ],
        tendencias: {
          mejorHorario: "matutino",
          materiaFavorita: "Matemáticas",
          tipoActividadPreferida: "gamificada",
        },
      }

      const responseIA = await fetch("/api/informe-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datosEstudiante,
          periodoAnalisis: "semanal",
          incluirPredicciones: true,
        }),
      })

      if (responseIA.ok) {
        const dataIA = await responseIA.json()
        if (dataIA.success) {
          setInforme({
            ...dataIA.informe,
            // Mantener algunos datos simulados para la demo
            alumno: "Juan Estudiante",
            curso: "3°A",
            periodo: "Semana del 15-19 Enero 2024",
            resumen: {
              atencionPromedio: 88,
              participacionPromedio: 85,
              puntosGanados: 1250,
              mejoraSemanal: 12,
              diasAsistencia: 5,
              totalDias: 5,
            },
          })
          return
        }
      }

      // Fallback al informe original si falla la IA
      const response = await fetch("/api/informe")
      const data = await response.json()
      setInforme(data)
    } catch (error) {
      console.error("Error cargando informe:", error)
      // Datos simulados como último recurso
      setInforme({
        alumno: "Juan Estudiante",
        curso: "3°A",
        periodo: "Semana del 15-19 Enero 2024",
        resumenEjecutivo: "Informe generado en modo offline",
        generadoPorIA: false,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando informe...</p>
        </div>
      </div>
    )
  }

  const datosSemanales = [
    { dia: "Lun", atencion: 85, participacion: 78 },
    { dia: "Mar", atencion: 88, participacion: 82 },
    { dia: "Mie", atencion: 92, participacion: 85 },
    { dia: "Jue", atencion: 87, participacion: 90 },
    { dia: "Vie", atencion: 90, participacion: 88 },
  ]

  const datosMaterias = [
    { materia: "Matemáticas", progreso: 85, participacion: 90 },
    { materia: "Historia", progreso: 78, participacion: 85 },
    { materia: "Literatura", progreso: 92, participacion: 88 },
    { materia: "Ciencias", progreso: 88, participacion: 82 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <img src="/clasio-logo.png" alt="Clasio Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Informe de Progreso</h1>
              <p className="text-gray-600">Seguimiento semanal de {informe?.alumno || "tu hijo/a"}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-black"
          >
            Cerrar Sesión
          </Button>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">88%</div>
                  <div className="text-sm text-gray-600">Atención Promedio</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">85%</div>
                  <div className="text-sm text-gray-600">Participación</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">1,250</div>
                  <div className="text-sm text-gray-600">Puntos Ganados</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-800">+12%</div>
                  <div className="text-sm text-gray-600">Mejora Semanal</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Análisis con IA */}
        {informe?.generadoPorIA && (
          <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                Análisis Inteligente
              </CardTitle>
              <CardDescription>Insights generados con Inteligencia Artificial</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">📊 Resumen Ejecutivo</h4>
                <p className="text-gray-700 text-sm">{informe.resumenEjecutivo}</p>
              </div>

              {informe.prediccionesProgreso && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🔮 Predicción de Progreso</h4>
                  <p className="text-blue-700 text-sm">{informe.prediccionesProgreso}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Gráfico de Progreso Semanal */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5 text-primary" />
                Progreso Semanal
              </CardTitle>
              <CardDescription>Atención y participación día a día</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosSemanales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dia" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="atencion" stroke="#53EBF3" strokeWidth={3} name="Atención" />
                  <Line type="monotone" dataKey="participacion" stroke="#00D2DF" strokeWidth={3} name="Participación" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Progreso por Materia */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Progreso por Materia</CardTitle>
              <CardDescription>Rendimiento en cada asignatura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {datosMaterias.map((materia, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{materia.materia}</span>
                    <Badge variant="outline">{materia.progreso}%</Badge>
                  </div>
                  <Progress value={materia.progreso} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Progreso: {materia.progreso}%</span>
                    <span>Participación: {materia.participacion}%</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Actividades Recientes y Recomendaciones */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Actividades Recientes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Actividades Recientes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { actividad: "Completó trivia de Historia", puntos: 75, tiempo: "Hace 2 horas" },
                { actividad: "Participó en pausa activa", puntos: 25, tiempo: "Hace 4 horas" },
                { actividad: "Resolvió ejercicios de Matemáticas", puntos: 100, tiempo: "Ayer" },
                { actividad: "Votó en propuesta estudiantil", puntos: 10, tiempo: "Hace 2 días" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.actividad}</div>
                    <div className="text-xs text-gray-600">{item.tiempo}</div>
                  </div>
                  <Badge className="bg-primary text-black">+{item.puntos}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recomendaciones */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Recomendaciones</CardTitle>
              <CardDescription>Sugerencias para mejorar el aprendizaje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-semibold text-primary mb-2">📚 Refuerzo en Historia</h4>
                <p className="text-sm text-gray-700">
                  Se recomienda dedicar más tiempo a los temas de historia contemporánea.
                </p>
              </div>

              <div className="p-4 bg-secondary/10 rounded-lg">
                <h4 className="font-semibold text-secondary mb-2">🎯 Excelente Participación</h4>
                <p className="text-sm text-gray-700">Mantiene un nivel alto de participación en clase. ¡Sigue así!</p>
              </div>

              <div className="p-4 bg-green-100 rounded-lg">
                <h4 className="font-semibold text-green-700 mb-2">⭐ Fortaleza en Matemáticas</h4>
                <p className="text-sm text-gray-700">
                  Demuestra comprensión sólida en resolución de problemas matemáticos.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
