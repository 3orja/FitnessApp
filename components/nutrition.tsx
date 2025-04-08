"use client"

import { useState } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProgressRing } from "../components/ui/progress-ring"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { format, parseISO, startOfDay, endOfDay, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2, Apple, Flame, Droplets, Plus } from "lucide-react"
import type { NutritionEntry } from "../lib/types"

interface MacroData {
  name: string
  value: number
  color: string
}

interface CalorieChartData {
  name: string
  calories: number
}

export default function Nutrition() {
  const { nutritionEntries, addNutritionEntry, deleteNutritionEntry } = useFitness()
  const [newEntry, setNewEntry] = useState<Partial<NutritionEntry>>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
    mealType: "breakfast",
    foods: [],
  })
  const [foodItem, setFoodItem] = useState("")
  const [timeRange, setTimeRange] = useState<"today" | "week" | "month">("today")

  const handleInputChange = (field: string, value: string | number | string[] | undefined) => {
    setNewEntry((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const addFoodItem = () => {
    if (!foodItem.trim()) return

    const currentFoods = newEntry.foods || []
    setNewEntry({
      ...newEntry,
      foods: [...currentFoods, foodItem.trim()],
    })
    setFoodItem("")
  }

  const removeFoodItem = (index: number) => {
    const currentFoods = newEntry.foods || []
    setNewEntry({
      ...newEntry,
      foods: currentFoods.filter((_, i) => i !== index),
    })
  }

  const handleAddEntry = () => {
    if (newEntry.calories === 0 && newEntry.water === 0) {
      toast.error("Error", {
        description: "Por favor, introduce al menos calorías o agua",
      })
      return
    }

    addNutritionEntry({
      calories: newEntry.calories || 0,
      protein: newEntry.protein || 0,
      carbs: newEntry.carbs || 0,
      fat: newEntry.fat || 0,
      water: newEntry.water || 0,
      mealType: newEntry.mealType,
      foods: newEntry.foods,
      notes: newEntry.notes,
    })

    // Limpiar formulario
    setNewEntry({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      water: 0,
      mealType: "breakfast",
      foods: [],
    })

    toast.success("Entrada añadida", {
      description: "Tu registro nutricional ha sido añadido correctamente",
    })
  }

  const handleDeleteEntry = (id: string) => {
    deleteNutritionEntry(id)

    toast.success("Entrada eliminada", {
      description: "El registro nutricional ha sido eliminado correctamente",
    })
  }

  const formatDate = (dateString: string, short = false) => {
    return format(parseISO(dateString), short ? "dd MMM" : "dd MMMM yyyy, HH:mm", { locale: es })
  }

  // Filtrar entradas según el rango de tiempo
  const getFilteredEntries = () => {
    const today = new Date()
    let startDate: Date

    switch (timeRange) {
      case "today":
        startDate = startOfDay(today)
        break
      case "week":
        startDate = subDays(today, 7)
        break
      case "month":
        startDate = subDays(today, 30)
        break
      default:
        startDate = startOfDay(today)
    }

    return nutritionEntries.filter(
      (entry) => parseISO(entry.date) >= startDate && parseISO(entry.date) <= endOfDay(today),
    )
  }

  const filteredEntries = getFilteredEntries()

  // Ordenar entradas por fecha (más reciente primero)
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calcular totales
  const calculateTotals = () => {
    return filteredEntries.reduce(
      (totals, entry) => {
        return {
          calories: totals.calories + entry.calories,
          protein: totals.protein + entry.protein,
          carbs: totals.carbs + entry.carbs,
          fat: totals.fat + entry.fat,
          water: totals.water + entry.water,
        }
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
    )
  }

  const totals = calculateTotals()

  // Calcular promedios diarios
  const calculateDailyAverages = () => {
    if (filteredEntries.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 }

    const days = timeRange === "today" ? 1 : timeRange === "week" ? 7 : 30

    return {
      calories: Math.round(totals.calories / days),
      protein: Math.round(totals.protein / days),
      carbs: Math.round(totals.carbs / days),
      fat: Math.round(totals.fat / days),
      water: +(totals.water / days).toFixed(1),
    }
  }

  const dailyAverages = calculateDailyAverages()

  // Preparar datos para el gráfico de macronutrientes
  const macroData: MacroData[] = [
    { name: "Proteínas", value: totals.protein, color: "#8884d8" },
    { name: "Carbohidratos", value: totals.carbs, color: "#82ca9d" },
    { name: "Grasas", value: totals.fat, color: "#ffc658" },
  ]

  // Preparar datos para el gráfico de calorías por día
  const getCaloriesByDay = (): CalorieChartData[] => {
    if (timeRange === "today") {
      return filteredEntries.map((entry) => ({
        name:
          entry.mealType === "breakfast"
            ? "Desayuno"
            : entry.mealType === "lunch"
              ? "Almuerzo"
              : entry.mealType === "dinner"
                ? "Cena"
                : "Snack",
        calories: entry.calories,
      }))
    }

    const caloriesByDay: Record<string, number> = {}

    filteredEntries.forEach((entry) => {
      const day = format(parseISO(entry.date), "dd/MM")
      caloriesByDay[day] = (caloriesByDay[day] || 0) + entry.calories
    })

    return Object.entries(caloriesByDay).map(([day, calories]) => ({
      name: day,
      calories,
    }))
  }

  const calorieChartData = getCaloriesByDay()

  // Objetivos diarios (ejemplo)
  const dailyGoals = {
    calories: 2000,
    protein: 150,
    carbs: 200,
    fat: 70,
    water: 2.5,
  }

  // Calcular progreso hacia los objetivos
  const calculateProgress = (current: number, goal: number) => {
    return Math.min(100, Math.round((current / goal) * 100))
  }

  const progress = {
    calories: calculateProgress(dailyAverages.calories, dailyGoals.calories),
    protein: calculateProgress(dailyAverages.protein, dailyGoals.protein),
    carbs: calculateProgress(dailyAverages.carbs, dailyGoals.carbs),
    fat: calculateProgress(dailyAverages.fat, dailyGoals.fat),
    water: calculateProgress(dailyAverages.water, dailyGoals.water),
  }

  // Traducir tipo de comida
  const translateMealType = (type?: string) => {
    switch (type) {
      case "breakfast":
        return "Desayuno"
      case "lunch":
        return "Almuerzo"
      case "dinner":
        return "Cena"
      case "snack":
        return "Snack"
      default:
        return "No especificado"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar alimentación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de comida</label>
              <Select value={newEntry.mealType} onValueChange={(value) => handleInputChange("mealType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Calorías</label>
              <Input
                type="number"
                min="0"
                placeholder="Ej: 500"
                value={newEntry.calories || ""}
                onChange={(e) => handleInputChange("calories", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Proteínas (g)</label>
              <Input
                type="number"
                min="0"
                placeholder="Ej: 30"
                value={newEntry.protein || ""}
                onChange={(e) => handleInputChange("protein", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Carbohidratos (g)</label>
              <Input
                type="number"
                min="0"
                placeholder="Ej: 60"
                value={newEntry.carbs || ""}
                onChange={(e) => handleInputChange("carbs", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Grasas (g)</label>
              <Input
                type="number"
                min="0"
                placeholder="Ej: 15"
                value={newEntry.fat || ""}
                onChange={(e) => handleInputChange("fat", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Agua (litros)</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              placeholder="Ej: 0.5"
              value={newEntry.water || ""}
              onChange={(e) => handleInputChange("water", Number.parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Alimentos</label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Ej: Pollo a la plancha"
                value={foodItem}
                onChange={(e) => setFoodItem(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addFoodItem()}
              />
              <Button onClick={addFoodItem} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {newEntry.foods && newEntry.foods.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {newEntry.foods.map((food, index) => (
                  <div key={index} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <span>{food}</span>
                    <button
                      onClick={() => removeFoodItem(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
            <Textarea
              placeholder="Notas adicionales..."
              value={newEntry.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              rows={2}
            />
          </div>

          <Button onClick={handleAddEntry} className="w-full">
            Registrar alimentación
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <CardTitle>Resumen nutricional</CardTitle>
            <div className="mt-2 sm:mt-0">
              <Tabs
                value={timeRange}
                onValueChange={(value) => setTimeRange(value as "today" | "week" | "month")}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="today">Hoy</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <div className="flex flex-col items-center">
              <ProgressRing progress={progress.calories} size={80} strokeWidth={8}>
                <Flame className="h-5 w-5 text-primary" />
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-xs text-muted-foreground">Calorías</div>
                <div className="font-medium">
                  {dailyAverages.calories} / {dailyGoals.calories}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress.protein} size={80} strokeWidth={8}>
                <div className="text-xs font-bold">P</div>
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-xs text-muted-foreground">Proteínas</div>
                <div className="font-medium">
                  {dailyAverages.protein}g / {dailyGoals.protein}g
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress.carbs} size={80} strokeWidth={8}>
                <div className="text-xs font-bold">C</div>
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-xs text-muted-foreground">Carbos</div>
                <div className="font-medium">
                  {dailyAverages.carbs}g / {dailyGoals.carbs}g
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress.fat} size={80} strokeWidth={8}>
                <div className="text-xs font-bold">G</div>
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-xs text-muted-foreground">Grasas</div>
                <div className="font-medium">
                  {dailyAverages.fat}g / {dailyGoals.fat}g
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <ProgressRing progress={progress.water} size={80} strokeWidth={8} foreground="stroke-blue-500">
                <Droplets className="h-5 w-5 text-blue-500" />
              </ProgressRing>
              <div className="mt-2 text-center">
                <div className="text-xs text-muted-foreground">Agua</div>
                <div className="font-medium">
                  {dailyAverages.water}L / {dailyGoals.water}L
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Calorías por {timeRange === "today" ? "comida" : "día"}</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calorieChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="calories" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Distribución de macronutrientes</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de alimentación</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay registros de alimentación en este período.
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <Apple className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">{translateMealType(entry.mealType)}</h3>
                      </div>
                      <div className="text-sm text-muted-foreground">{formatDate(entry.date)}</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 text-sm">
                    <div className="bg-muted rounded-md p-2 text-center">
                      <div className="text-xs text-muted-foreground">Calorías</div>
                      <div className="font-medium">{entry.calories}</div>
                    </div>
                    <div className="bg-muted rounded-md p-2 text-center">
                      <div className="text-xs text-muted-foreground">Proteínas</div>
                      <div className="font-medium">{entry.protein}g</div>
                    </div>
                    <div className="bg-muted rounded-md p-2 text-center">
                      <div className="text-xs text-muted-foreground">Carbos</div>
                      <div className="font-medium">{entry.carbs}g</div>
                    </div>
                    <div className="bg-muted rounded-md p-2 text-center">
                      <div className="text-xs text-muted-foreground">Grasas</div>
                      <div className="font-medium">{entry.fat}g</div>
                    </div>
                    <div className="bg-muted rounded-md p-2 text-center">
                      <div className="text-xs text-muted-foreground">Agua</div>
                      <div className="font-medium">{entry.water}L</div>
                    </div>
                  </div>

                  {entry.foods && entry.foods.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-muted-foreground mb-1">Alimentos:</div>
                      <div className="flex flex-wrap gap-1">
                        {entry.foods.map((food, index) => (
                          <div key={index} className="bg-muted px-2 py-0.5 rounded-full text-xs">
                            {food}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.notes && (
                    <div className="mt-3 text-sm">
                      <div className="text-xs text-muted-foreground mb-1">Notas:</div>
                      <div className="text-sm">{entry.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
