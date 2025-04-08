"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

interface Workout {
  id: string
  date: string
  name: string
  exercises: Exercise[]
}

export default function WorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>([])

  // Load workouts from localStorage
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts")
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts))
    }
  }, [])

  const deleteWorkout = (id: string) => {
    const updatedWorkouts = workouts.filter((workout) => workout.id !== id)
    setWorkouts(updatedWorkouts)
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))

    toast.success("Entrenamiento eliminado", {
      description: "El entrenamiento ha sido eliminado correctamente",
    })
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "dd MMMM yyyy, HH:mm", { locale: es })
  }

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historial de entrenamientos</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedWorkouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay entrenamientos registrados</div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {sortedWorkouts.map((workout) => (
                <AccordionItem key={workout.id} value={workout.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex justify-between items-center w-full pr-4">
                      <div className="text-left">
                        <div className="font-medium">{workout.name}</div>
                        <div className="text-sm text-muted-foreground">{formatDate(workout.date)}</div>
                      </div>
                      <div className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {workout.exercises.length} ejercicios
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      {workout.exercises.map((exercise) => (
                        <div key={exercise.id} className="border rounded-lg p-3">
                          <div className="font-medium">{exercise.name}</div>
                          <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Series:</span> {exercise.sets}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Reps:</span> {exercise.reps}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Peso:</span> {exercise.weight} kg
                            </div>
                          </div>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteWorkout(workout.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar entrenamiento
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

