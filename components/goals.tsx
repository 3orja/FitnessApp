"use client"

import { useState } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "../components/ui/progress-ring"
import { format, parseISO, differenceInDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Target, Check, Trash2, Calendar, Weight, Dumbbell, Heart, Clock, Plus } from "lucide-react"
import type { Goal } from "../lib/types"

export default function Goals() {
  const { goals, addGoal, updateGoalProgress, completeGoal, deleteGoal } = useFitness()
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    type: "custom",
    targetValue: undefined,
    unit: "",
    targetDate: undefined,
  })
  const [activeTab, setActiveTab] = useState<"active" | "completed">("active")

  const handleInputChange = (field: string, value: string | number | undefined) => {
    setNewGoal((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Corregir la función handleAddGoal para asegurarnos de que el objeto pasado a addGoal tenga la estructura correcta

  const handleAddGoal = () => {
    if (!newGoal.title) {
      toast.error("Error", {
        description: "Por favor, introduce un título para el objetivo",
      })
      return
    }

    // Asegurarnos de que todos los campos necesarios estén presentes y con el tipo correcto
    addGoal({
      title: newGoal.title,
      description: newGoal.description || "",
      type: newGoal.type as Goal["type"],
      targetValue: newGoal.targetValue,
      unit: newGoal.unit || "",
      targetDate: newGoal.targetDate,
    })

    // Limpiar formulario
    setNewGoal({
      title: "",
      description: "",
      type: "custom",
      targetValue: undefined,
      unit: "",
      targetDate: undefined,
    })

    toast.success("Objetivo añadido", {
      description: "Tu objetivo ha sido añadido correctamente",
    })
  }

  const handleUpdateProgress = (id: string, progress: number) => {
    updateGoalProgress(id, progress)

    toast.success("Progreso actualizado", {
      description: "El progreso del objetivo ha sido actualizado",
    })
  }

  const handleCompleteGoal = (id: string) => {
    completeGoal(id)

    toast.success("¡Objetivo completado!", {
      description: "Has completado tu objetivo con éxito",
    })
  }

  const handleDeleteGoal = (id: string) => {
    deleteGoal(id)

    toast.success("Objetivo eliminado", {
      description: "El objetivo ha sido eliminado correctamente",
    })
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Sin fecha"
    return format(parseISO(dateString), "dd MMMM yyyy", { locale: es })
  }

  // Filtrar objetivos
  const activeGoals = goals.filter((goal) => !goal.completed)
  const completedGoals = goals.filter((goal) => goal.completed)

  // Calcular días restantes
  const getDaysRemaining = (targetDate?: string) => {
    if (!targetDate) return null

    const today = new Date()
    const target = parseISO(targetDate)

    const days = differenceInDays(target, today)
    return days >= 0 ? days : 0
  }

  // Obtener icono según el tipo
  const getTypeIcon = (type: Goal["type"]) => {
    switch (type) {
      case "weight":
        return <Weight className="h-5 w-5" />
      case "strength":
        return <Dumbbell className="h-5 w-5" />
      case "endurance":
        return <Heart className="h-5 w-5" />
      case "habit":
        return <Clock className="h-5 w-5" />
      default:
        return <Target className="h-5 w-5" />
    }
  }

  // Obtener color según el tipo
  const getTypeColor = (type: Goal["type"]) => {
    switch (type) {
      case "weight":
        return "text-blue-500"
      case "strength":
        return "text-purple-500"
      case "endurance":
        return "text-red-500"
      case "habit":
        return "text-green-500"
      default:
        return "text-primary"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Añadir nuevo objetivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              placeholder="Ej: Perder 5kg"
              value={newGoal.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de objetivo</label>
              <Select value={newGoal.type} onValueChange={(value) => handleInputChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight">Peso</SelectItem>
                  <SelectItem value="strength">Fuerza</SelectItem>
                  <SelectItem value="endurance">Resistencia</SelectItem>
                  <SelectItem value="habit">Hábito</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Fecha objetivo (opcional)</label>
              <Input
                type="date"
                value={newGoal.targetDate || ""}
                onChange={(e) => handleInputChange("targetDate", e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Valor objetivo (opcional)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Ej: 70"
                value={newGoal.targetValue !== undefined ? newGoal.targetValue : ""}
                onChange={(e) =>
                  handleInputChange("targetValue", e.target.value ? Number.parseFloat(e.target.value) : undefined)
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Unidad (opcional)</label>
              <Input
                placeholder="Ej: kg, repeticiones, km"
                value={newGoal.unit}
                onChange={(e) => handleInputChange("unit", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <Textarea
              placeholder="Describe tu objetivo..."
              value={newGoal.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <Button onClick={handleAddGoal} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Añadir objetivo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mis objetivos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "active" | "completed")}>
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Activos ({activeGoals.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                Completados ({completedGoals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tienes objetivos activos. ¡Añade uno nuevo!
                </div>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <ProgressRing progress={goal.progress} size={60} strokeWidth={6}>
                              <div className={getTypeColor(goal.type)}>{getTypeIcon(goal.type)}</div>
                            </ProgressRing>
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{goal.title}</h3>
                                {goal.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleCompleteGoal(goal.id)}>
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              {goal.targetValue !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Meta: {goal.targetValue} {goal.unit}
                                  </span>
                                </div>
                              )}

                              {goal.targetDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    {getDaysRemaining(goal.targetDate) === 0
                                      ? "Hoy es el día!"
                                      : `${getDaysRemaining(goal.targetDate)} días restantes`}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progreso</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${goal.progress}%` }} />
                              </div>

                              <div className="flex justify-between mt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateProgress(goal.id, Math.max(0, goal.progress - 10))}
                                >
                                  -10%
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUpdateProgress(goal.id, Math.min(100, goal.progress + 10))}
                                >
                                  +10%
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedGoals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No tienes objetivos completados todavía.</div>
              ) : (
                <div className="space-y-4">
                  {completedGoals.map((goal) => (
                    <Card key={goal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <ProgressRing progress={100} size={60} strokeWidth={6} foreground="stroke-green-500">
                              <Check className="h-5 w-5 text-green-500" />
                            </ProgressRing>
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{goal.title}</h3>
                                {goal.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{goal.description}</p>
                                )}
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                              {goal.targetValue !== undefined && (
                                <div className="flex items-center gap-1">
                                  <Target className="h-4 w-4 text-muted-foreground" />
                                  <span>
                                    Meta: {goal.targetValue} {goal.unit}
                                  </span>
                                </div>
                              )}

                              {goal.targetDate && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>Fecha: {formatDate(goal.targetDate)}</span>
                                </div>
                              )}
                            </div>

                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Completado</span>
                                <span>100%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
