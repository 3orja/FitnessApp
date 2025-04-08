"use client"

import { useState, useEffect } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RestTimer } from "../components/ui/rest-timer"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner"
import { Plus, Trash2, Save, Clock, Dumbbell, ListChecks } from "lucide-react"
import { exercisesByCategory } from "../lib/default-data"
import type { Exercise } from "../lib/types"

export default function WorkoutTracker() {
  const { currentWorkout, updateCurrentWorkout, addWorkout, routines, exerciseCategories } = useFitness()

  const [selectedCategory, setSelectedCategory] = useState<string>("chest")
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [showRestTimer, setShowRestTimer] = useState(false)
  const [restTime, setRestTime] = useState(60)
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null)

  // Iniciar el temporizador de entrenamiento cuando se añade el primer ejercicio
  useEffect(() => {
    if (currentWorkout?.exercises?.length === 1 && !workoutStartTime) {
      setWorkoutStartTime(new Date())
    }
  }, [currentWorkout?.exercises, workoutStartTime])

  // Calcular la duración del entrenamiento
  const calculateDuration = () => {
    if (!workoutStartTime) return 0

    const now = new Date()
    return Math.floor((now.getTime() - workoutStartTime.getTime()) / 60000) // en minutos
  }

  const handleNameChange = (name: string) => {
    updateCurrentWorkout({ name })
  }

  const addExercise = () => {
    if (!selectedExercise) {
      toast.error("Error", {
        description: "Por favor, selecciona un ejercicio",
      })
      return
    }

    const newExercise: Exercise = {
      id: uuidv4(),
      name: selectedExercise,
      sets: 3,
      reps: 10,
      weight: 0,
      restTime: 60,
      categoryId: selectedCategory,
    }

    const currentExercises = currentWorkout?.exercises || []
    updateCurrentWorkout({
      exercises: [...currentExercises, newExercise],
    })

    setSelectedExercise("")

    toast.success("Ejercicio añadido", {
      description: "El ejercicio ha sido añadido correctamente",
    })
  }

  const updateExercise = (id: string, field: keyof Exercise, value: number | string) => {
    const currentExercises = currentWorkout?.exercises || []
    updateCurrentWorkout({
      exercises: currentExercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)),
    })
  }

  const removeExercise = (id: string) => {
    const currentExercises = currentWorkout?.exercises || []
    updateCurrentWorkout({
      exercises: currentExercises.filter((ex) => ex.id !== id),
    })

    toast.success("Ejercicio eliminado", {
      description: "El ejercicio ha sido eliminado correctamente",
    })
  }

  const startRestTimer = (exerciseId: string, time: number) => {
    setRestTime(time)
    setShowRestTimer(true)
  }

  const handleRestComplete = () => {
    toast.success("Descanso completado", {
      description: "¡Es hora de continuar con tu entrenamiento!",
    })
    setShowRestTimer(false)
  }

  const saveWorkout = () => {
    if (!currentWorkout?.name) {
      toast.error("Error", {
        description: "Por favor, añade un nombre al entrenamiento",
      })
      return
    }

    if (!currentWorkout?.exercises || currentWorkout.exercises.length === 0) {
      toast.error("Error", {
        description: "Añade al menos un ejercicio",
      })
      return
    }

    // Calcular la duración total
    const duration = calculateDuration()

    // Estimar calorías quemadas (ejemplo simple)
    const caloriesBurned = Math.round(duration * 8) // ~8 calorías por minuto

    addWorkout({
      name: currentWorkout.name,
      exercises: currentWorkout.exercises,
      duration,
      caloriesBurned,
    })

    // Resetear el temporizador
    setWorkoutStartTime(null)

    toast.success("¡Entrenamiento guardado!", {
      description: "Tu entrenamiento ha sido guardado correctamente",
    })
  }

  const startRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine) return

    updateCurrentWorkout({
      name: routine.name,
      exercises: routine.exercises.map((ex) => ({
        ...ex,
        id: uuidv4(), // Generar nuevos IDs para los ejercicios
      })),
    })

    setWorkoutStartTime(new Date())

    toast.success("Rutina cargada", {
      description: `La rutina "${routine.name}" ha sido cargada correctamente`,
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="new">
        <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto mb-6">
          <TabsTrigger value="new" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Nuevo entrenamiento
          </TabsTrigger>
          <TabsTrigger value="routines" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            Rutinas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Registrar entrenamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="workout-name" className="block text-sm font-medium mb-1">
                  Nombre del entrenamiento
                </label>
                <Input
                  id="workout-name"
                  placeholder="Ej: Día de pierna"
                  value={currentWorkout?.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Añadir ejercicio</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {exerciseCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ejercicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {exercisesByCategory[selectedCategory as keyof typeof exercisesByCategory]?.map((exercise) => (
                          <SelectItem key={exercise} value={exercise}>
                            {exercise}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={addExercise} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir ejercicio
                </Button>
              </div>

              {workoutStartTime && (
                <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Tiempo: {calculateDuration()} minutos</span>
                </div>
              )}
            </CardContent>
          </Card>

          {currentWorkout?.exercises && currentWorkout.exercises.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Ejercicios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentWorkout.exercises.map((exercise) => (
                    <div key={exercise.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium">{exercise.name}</h3>
                        <Button variant="ghost" size="icon" onClick={() => removeExercise(exercise.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs mb-1">Series</label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => updateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Repeticiones</label>
                          <Input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) => updateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Peso (kg)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight}
                            onChange={(e) =>
                              updateExercise(exercise.id, "weight", Number.parseFloat(e.target.value) || 0)
                            }
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Descanso (seg)</label>
                          <Input
                            type="number"
                            min="0"
                            step="5"
                            value={exercise.restTime || 60}
                            onChange={(e) =>
                              updateExercise(exercise.id, "restTime", Number.parseInt(e.target.value) || 60)
                            }
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs mb-1">Notas</label>
                        <Textarea
                          placeholder="Notas opcionales"
                          value={exercise.notes || ""}
                          onChange={(e) => updateExercise(exercise.id, "notes", e.target.value)}
                          className="resize-none"
                          rows={2}
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startRestTimer(exercise.id, exercise.restTime || 60)}
                          className="text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Descanso
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveWorkout} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar entrenamiento
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="routines">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {routines.map((routine) => (
              <Card key={routine.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{routine.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground mb-2">{routine.description}</p>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>Nivel:</span>
                      <span className="font-medium capitalize">{routine.level}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Duración:</span>
                      <span className="font-medium">{routine.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ejercicios:</span>
                      <span className="font-medium">{routine.exercises.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => startRoutine(routine.id)}>
                    Iniciar rutina
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {showRestTimer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-[300px]">
            <CardHeader>
              <CardTitle className="text-center">Tiempo de descanso</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <RestTimer duration={restTime} onComplete={handleRestComplete} autoStart={true} size="lg" />
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" onClick={() => setShowRestTimer(false)}>
                Cancelar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
