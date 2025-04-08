"use client"

import { useFitness } from "../contexts/fitness-context"
import { Card, CardContent } from "@/components/ui/card"
import { ProgressRing } from "../components/ui/progress-ring"
import { Dumbbell, TrendingUp, Calendar, Award } from "lucide-react"
import { startOfWeek, endOfWeek } from "date-fns"
import { es } from "date-fns/locale"

export default function Dashboard() {
  const { workouts, weightEntries, goals } = useFitness()

  // Calcular estadísticas
  const totalWorkouts = workouts.length

  const calculateWeeklyWorkouts = () => {
    const now = new Date()
    const weekStart = startOfWeek(now, { locale: es })
    const weekEnd = endOfWeek(now, { locale: es })

    return workouts.filter((workout) => {
      const workoutDate = new Date(workout.date)
      return workoutDate >= weekStart && workoutDate <= weekEnd
    }).length
  }

  const weeklyWorkouts = calculateWeeklyWorkouts()

  const calculateStreak = () => {
    if (workouts.length === 0) return 0

    // Ordenar entrenamientos por fecha
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Comprobar si hay un entrenamiento hoy
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const latestWorkoutDate = new Date(sortedWorkouts[0].date)
    latestWorkoutDate.setHours(0, 0, 0, 0)

    // Si no hay entrenamiento hoy, la racha es 0
    if (latestWorkoutDate.getTime() !== today.getTime()) {
      return 0
    }

    // Contar días consecutivos con entrenamientos
    let streak = 1
    let currentDate = today

    for (let i = 1; i < sortedWorkouts.length; i++) {
      const prevDate = new Date(currentDate)
      prevDate.setDate(prevDate.getDate() - 1)

      const workoutDate = new Date(sortedWorkouts[i].date)
      workoutDate.setHours(0, 0, 0, 0)

      if (workoutDate.getTime() === prevDate.getTime()) {
        streak++
        currentDate = prevDate
      } else {
        break
      }
    }

    return streak
  }

  const currentStreak = calculateStreak()

  const calculateWeightChange = () => {
    if (weightEntries.length < 2) return 0

    const sortedWeights = [...weightEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const firstWeight = sortedWeights[0].weight
    const lastWeight = sortedWeights[sortedWeights.length - 1].weight

    return lastWeight - firstWeight
  }

  const weightChange = calculateWeightChange()

  // Calcular progreso de objetivos
  const activeGoals = goals.filter((goal) => !goal.completed)
  const goalProgress =
    activeGoals.length > 0 ? activeGoals.reduce((sum, goal) => sum + goal.progress, 0) / activeGoals.length : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Dumbbell className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Total entrenamientos</p>
            <p className="text-3xl font-bold">{totalWorkouts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Calendar className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Esta semana</p>
            <p className="text-3xl font-bold">{weeklyWorkouts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Award className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Racha actual</p>
            <p className="text-3xl font-bold">{currentStreak} días</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Cambio de peso</p>
            <p
              className={`text-3xl font-bold ${weightChange < 0 ? "text-green-500" : weightChange > 0 ? "text-red-500" : ""}`}
            >
              {weightChange > 0 ? "+" : ""}
              {weightChange.toFixed(1)} kg
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Evolución de peso</h3>
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Registra tu peso para ver la evolución
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Objetivos</h3>
            <div className="flex items-center justify-center mb-4">
              <ProgressRing progress={goalProgress} size={120} strokeWidth={12}>
                <div className="text-center">
                  <div className="text-3xl font-bold">{Math.round(goalProgress)}%</div>
                  <div className="text-xs text-muted-foreground">Progreso</div>
                </div>
              </ProgressRing>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{activeGoals.length}</div>
                <div className="text-sm text-muted-foreground">Activos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{goals.filter((g) => g.completed).length}</div>
                <div className="text-sm text-muted-foreground">Completados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
