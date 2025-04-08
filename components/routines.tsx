"use client"

import { useState } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "sonner"
import { v4 as uuidv4 } from "uuid"
import { Plus, Trash2, Dumbbell, Clock, Calendar, BarChart3, Copy } from "lucide-react"
import type { WorkoutRoutine, Exercise } from "../lib/types"
import { exercisesByCategory } from "../lib/default-data"

export default function Routines() {
  const { routines, addRoutine, deleteRoutine, updateCurrentWorkout } = useFitness()
  const [newRoutine, setNewRoutine] = useState<Partial<WorkoutRoutine>>({
    name: "",
    description: "",
    exercises: [],
    frequency: [],
    duration: 45,
    level: "beginner",
  })
  const [selectedCategory, setSelectedCategory] = useState<string>("chest")
  const [selectedExercise, setSelectedExercise] = useState<string>("")
  const [showDialog, setShowDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "beginner" | "intermediate" | "advanced">("all")

  const handleInputChange = (field: string, value: string | number | string[] | Exercise[] | undefined) => {
    setNewRoutine((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addExerciseToRoutine = () => {
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

    const currentExercises = newRoutine.exercises || []
    setNewRoutine({
      ...newRoutine,
      exercises: [...currentExercises, newExercise],
    })

    setSelectedExercise("")

    toast.success("Ejercicio añadido", {
      description: "El ejercicio ha sido añadido a la rutina",
    })
  }

  const updateExercise = (id: string, field: keyof Exercise, value: number | string | undefined) => {
    const currentExercises = newRoutine.exercises || []
    setNewRoutine({
      ...newRoutine,
      exercises: currentExercises.map((exercise) => (exercise.id === id ? { ...exercise, [field]: value } : exercise)),
    })
  }

  const removeExercise = (id: string) => {
    const currentExercises = newRoutine.exercises || []
    setNewRoutine({
      ...newRoutine,
      exercises: currentExercises.filter((exercise) => exercise.id !== id),
    })

    toast.success("Ejercicio eliminado", {
      description: "El ejercicio ha sido eliminado de la rutina",
    })
  }

  const handleAddRoutine = () => {
    if (!newRoutine.name) {
      toast.error("Error", {
        description: "Por favor, introduce un nombre para la rutina",
      })
      return
    }

    if (!newRoutine.exercises || newRoutine.exercises.length === 0) {
      toast.error("Error", {
        description: "Añade al menos un ejercicio a la rutina",
      })
      return
    }

    addRoutine({
      name: newRoutine.name,
      description: newRoutine.description,
      exercises: newRoutine.exercises,
      frequency: newRoutine.frequency,
      duration: newRoutine.duration,
      level: newRoutine.level as WorkoutRoutine["level"],
      category: newRoutine.category,
    })

    // Limpiar formulario
    setNewRoutine({
      name: "",
      description: "",
      exercises: [],
      frequency: [],
      duration: 45,
      level: "beginner",
    })

    setShowDialog(false)

    toast.success("Rutina añadida", {
      description: "Tu rutina ha sido añadida correctamente",
    })
  }

  const handleDeleteRoutine = (id: string) => {
    deleteRoutine(id)

    toast.success("Rutina eliminada", {
      description: "La rutina ha sido eliminada correctamente",
    })
  }

  const startRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine) return

    updateCurrentWorkout({
      name: routine.name,
      exercises: routine.exercises.map((exercise) => ({
        ...exercise,
        id: uuidv4(), // Generar nuevos IDs para los ejercicios
      })),
    })

    toast.success("Rutina cargada", {
      description: `La rutina "${routine.name}" ha sido cargada correctamente`,
    })
  }

  // Corregir la función duplicateRoutine para evitar el error con delete
  const duplicateRoutine = (routineId: string) => {
    const routine = routines.find((r) => r.id === routineId)
    if (!routine) return

    // Crear un nuevo objeto sin incluir el id usando desestructuración
    const { id: _id, ...routineWithoutId } = routine

    // Añadir la nueva rutina con los cambios necesarios
    addRoutine({
      ...routineWithoutId,
      name: `${routine.name} (copia)`,
      exercises: routine.exercises.map((exercise) => ({
        ...exercise,
        id: uuidv4(), // Generar nuevos IDs para los ejercicios
      })),
    })

    toast.success("Rutina duplicada", {
      description: "La rutina ha sido duplicada correctamente",
    })
  }

  // Filtrar rutinas según el nivel
  const filteredRoutines = activeTab === "all" ? routines : routines.filter((routine) => routine.level === activeTab)

  // Obtener días de la semana para el selector
  const weekdays = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miércoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sábado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
  ]

  // Función para formatear la frecuencia
  const formatFrequency = (frequency?: string[]) => {
    if (!frequency || frequency.length === 0) return "Flexible"

    if (frequency.length === 7) return "Todos los días"

    return frequency
      .map((day) => {
        const dayObj = weekdays.find((d) => d.value === day)
        return dayObj ? dayObj.label : day
      })
      .join(", ")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rutinas de entrenamiento</h2>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nueva rutina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crear nueva rutina</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre de la rutina</label>
                  <Input
                    placeholder="Ej: Rutina Full Body"
                    value={newRoutine.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nivel</label>
                  <Select value={newRoutine.level} onValueChange={(value) => handleInputChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Principiante</SelectItem>
                      <SelectItem value="intermediate">Intermedio</SelectItem>
                      <SelectItem value="advanced">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  placeholder="Describe tu rutina..."
                  value={newRoutine.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duración estimada (minutos)</label>
                  <Input
                    type="number"
                    min="1"
                    value={newRoutine.duration}
                    onChange={(e) => handleInputChange("duration", Number.parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Frecuencia recomendada</label>
                  <Select
                    value={newRoutine.frequency?.join(",")}
                    onValueChange={(value) => handleInputChange("frequency", value ? value.split(",") : [])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar días" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lunes,miércoles,viernes">Lunes, Miércoles, Viernes</SelectItem>
                      <SelectItem value="martes,jueves,sábado">Martes, Jueves, Sábado</SelectItem>
                      <SelectItem value="lunes,martes,miércoles,jueves,viernes">Lunes a Viernes</SelectItem>
                      <SelectItem value="lunes,martes,miércoles,jueves,viernes,sábado,domingo">
                        Todos los días
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Añadir ejercicios</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chest">Pecho</SelectItem>
                      <SelectItem value="back">Espalda</SelectItem>
                      <SelectItem value="legs">Piernas</SelectItem>
                      <SelectItem value="shoulders">Hombros</SelectItem>
                      <SelectItem value="arms">Brazos</SelectItem>
                      <SelectItem value="abs">Abdominales</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
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

                <Button onClick={addExerciseToRoutine} className="w-full mb-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir ejercicio
                </Button>

                {newRoutine.exercises && newRoutine.exercises.length > 0 && (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {newRoutine.exercises.map((exercise) => (
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
                              onChange={(e) =>
                                updateExercise(exercise.id, "sets", Number.parseInt(e.target.value) || 0)
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Repeticiones</label>
                            <Input
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) =>
                                updateExercise(exercise.id, "reps", Number.parseInt(e.target.value) || 0)
                              }
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
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRoutine}>Guardar rutina</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "beginner" | "intermediate" | "advanced")}
      >
        <TabsList className="grid grid-cols-4 w-full mb-6">
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="beginner">Principiante</TabsTrigger>
          <TabsTrigger value="intermediate">Intermedio</TabsTrigger>
          <TabsTrigger value="advanced">Avanzado</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRoutines.map((routine) => (
              <Card key={routine.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{routine.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground mb-2">{routine.description}</p>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        <span>Nivel:</span>
                      </div>
                      <span className="font-medium capitalize">
                        {routine.level === "beginner"
                          ? "Principiante"
                          : routine.level === "intermediate"
                            ? "Intermedio"
                            : "Avanzado"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duración:</span>
                      </div>
                      <span className="font-medium">{routine.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4 text-muted-foreground" />
                        <span>Ejercicios:</span>
                      </div>
                      <span className="font-medium">{routine.exercises.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Frecuencia:</span>
                      </div>
                      <span className="font-medium">{formatFrequency(routine.frequency)}</span>
                    </div>
                  </div>

                  <Accordion type="single" collapsible className="w-full mt-2">
                    <AccordionItem value="exercises">
                      <AccordionTrigger className="text-sm py-2">Ver ejercicios</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 text-sm">
                          {routine.exercises.map((exercise, index) => (
                            <div key={exercise.id} className="border rounded p-2">
                              <div className="font-medium">
                                {index + 1}. {exercise.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {exercise.sets} series × {exercise.reps} reps × {exercise.weight} kg
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="default" className="flex-1" onClick={() => startRoutine(routine.id)}>
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Iniciar
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => duplicateRoutine(routine.id)}
                    title="Duplicar rutina"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteRoutine(routine.id)}
                    title="Eliminar rutina"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
