"use client"

import { useState } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { format, parseISO, subDays, differenceInDays, addDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2, Calendar, TrendingUp } from "lucide-react"

// Definir una interfaz extendida para las entradas estimadas
interface EstimatedWeightEntry {
  date: string
  weight: number
  estimated?: boolean
}

export default function WeightTracker() {
  const { weightEntries, addWeightEntry, deleteWeightEntry } = useFitness()
  const [weight, setWeight] = useState("")
  const [notes, setNotes] = useState("")
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("30d")

  const handleAddWeight = () => {
    if (!weight || isNaN(Number.parseFloat(weight))) {
      toast.error("Error", {
        description: "Por favor, introduce un peso válido",
      })
      return
    }

    addWeightEntry(Number.parseFloat(weight))
    setWeight("")
    setNotes("")

    toast.success("Peso registrado", {
      description: "Tu peso ha sido registrado correctamente",
    })
  }

  const handleDeleteEntry = (id: string) => {
    deleteWeightEntry(id)

    toast.success("Entrada eliminada", {
      description: "La entrada de peso ha sido eliminada correctamente",
    })
  }

  const formatDate = (dateString: string, short = false) => {
    return format(parseISO(dateString), short ? "dd MMM" : "dd MMMM yyyy, HH:mm", { locale: es })
  }

  // Ordenar entradas por fecha (más reciente primero)
  const sortedEntries = [...weightEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Calcular estadísticas
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : 0

  const startWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : 0

  const weightChange = currentWeight - startWeight

  const getMinMaxWeight = () => {
    if (sortedEntries.length === 0) return { min: 0, max: 0 }

    let min = sortedEntries[0].weight
    let max = sortedEntries[0].weight

    sortedEntries.forEach((entry) => {
      if (entry.weight < min) min = entry.weight
      if (entry.weight > max) max = entry.weight
    })

    return { min, max }
  }

  const { min: minWeight, max: maxWeight } = getMinMaxWeight()

  // Calcular cambio en los últimos 7 días
  const getRecentChange = (days: number) => {
    if (sortedEntries.length < 2) return 0

    const today = new Date()
    const compareDate = subDays(today, days)

    const recentEntry = sortedEntries[0]

    // Encontrar la entrada más cercana a la fecha de comparación
    let closestEntry = sortedEntries[sortedEntries.length - 1]
    let minDiff = Math.abs(differenceInDays(parseISO(closestEntry.date), compareDate))

    sortedEntries.forEach((entry) => {
      const diff = Math.abs(differenceInDays(parseISO(entry.date), compareDate))
      if (diff < minDiff) {
        minDiff = diff
        closestEntry = entry
      }
    })

    return recentEntry.weight - closestEntry.weight
  }

  const weekChange = getRecentChange(7)
  const monthChange = getRecentChange(30)

  // Preparar datos para el gráfico
  const getChartData = () => {
    if (sortedEntries.length === 0) return []

    // Ordenar por fecha ascendente para el gráfico
    const chronologicalEntries = [...sortedEntries].reverse()

    // Filtrar por rango de tiempo
    const today = new Date()
    let startDate: Date

    switch (timeRange) {
      case "7d":
        startDate = subDays(today, 7)
        break
      case "30d":
        startDate = subDays(today, 30)
        break
      case "90d":
        startDate = subDays(today, 90)
        break
      default:
        startDate = new Date(0) // Todas las entradas
    }

    const filteredEntries = chronologicalEntries.filter((entry) => parseISO(entry.date) >= startDate)

    // Si no hay suficientes datos, rellenar con datos estimados
    if (filteredEntries.length < 2 && chronologicalEntries.length >= 2) {
      const firstEntry = chronologicalEntries[0]
      const lastEntry = chronologicalEntries[chronologicalEntries.length - 1]

      const totalDays = differenceInDays(parseISO(lastEntry.date), parseISO(firstEntry.date))
      if (totalDays > 0) {
        const dailyChange = (lastEntry.weight - firstEntry.weight) / totalDays

        // Crear entradas estimadas
        const estimatedEntries: EstimatedWeightEntry[] = []
        let currentDate = parseISO(firstEntry.date)
        let currentWeight = firstEntry.weight

        while (currentDate <= parseISO(lastEntry.date)) {
          if (currentDate >= startDate) {
            estimatedEntries.push({
              date: currentDate.toISOString(),
              weight: currentWeight,
              estimated: true,
            })
          }

          currentDate = addDays(currentDate, 1)
          currentWeight += dailyChange
        }

        // Combinar entradas reales y estimadas
        const combinedEntries: EstimatedWeightEntry[] = [
          ...filteredEntries.map((entry) => ({
            date: entry.date,
            weight: entry.weight,
            estimated: false,
          })),
        ]

        estimatedEntries.forEach((estimated) => {
          // Si no hay una entrada real para esta fecha, añadir la estimada
          if (!combinedEntries.some((entry) => isSameDay(parseISO(entry.date), parseISO(estimated.date)))) {
            combinedEntries.push(estimated)
          }
        })

        // Ordenar por fecha
        combinedEntries.sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())

        return combinedEntries.map((entry) => ({
          date: formatDate(entry.date, true),
          weight: entry.weight,
          estimated: entry.estimated,
        }))
      }
    }

    return filteredEntries.map((entry) => ({
      date: formatDate(entry.date, true),
      weight: entry.weight,
    }))
  }

  const chartData = getChartData()

  // Función auxiliar para comprobar si dos fechas son el mismo día
  function isSameDay(date1: Date, date2: Date) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  // Calcular tendencia
  const calculateTrend = () => {
    if (sortedEntries.length < 2) return "neutral"

    const recentChange = weekChange

    if (recentChange < -0.5) return "down"
    if (recentChange > 0.5) return "up"
    return "neutral"
  }

  const trend = calculateTrend()
  const trendColor = trend === "down" ? "text-green-500" : trend === "up" ? "text-red-500" : ""

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar peso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              step="0.1"
              placeholder="Peso en kg"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleAddWeight}>Registrar</Button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
            <Textarea
              placeholder="Ej: Después del desayuno, bien hidratado..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {sortedEntries.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Peso actual</p>
                  <p className="text-2xl font-bold">{currentWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Peso inicial</p>
                  <p className="text-2xl font-bold">{startWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Cambio total</p>
                  <p
                    className={`text-2xl font-bold ${weightChange < 0 ? "text-green-500" : weightChange > 0 ? "text-red-500" : ""}`}
                  >
                    {weightChange > 0 ? "+" : ""}
                    {weightChange.toFixed(1)} kg
                  </p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Rango</p>
                  <p className="text-2xl font-bold">
                    {minWeight.toFixed(1)} - {maxWeight.toFixed(1)} kg
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-sm font-medium">Últimos 7 días</p>
                    </div>
                    <p
                      className={`text-lg font-bold ${weekChange < 0 ? "text-green-500" : weekChange > 0 ? "text-red-500" : ""}`}
                    >
                      {weekChange > 0 ? "+" : ""}
                      {weekChange.toFixed(1)} kg
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2" />
                      <p className="text-sm font-medium">Últimos 30 días</p>
                    </div>
                    <p
                      className={`text-lg font-bold ${monthChange < 0 ? "text-green-500" : monthChange > 0 ? "text-red-500" : ""}`}
                    >
                      {monthChange > 0 ? "+" : ""}
                      {monthChange.toFixed(1)} kg
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <TrendingUp className={`h-5 w-5 mr-2 ${trendColor}`} />
                    <p className="text-sm font-medium">Tendencia actual</p>
                  </div>
                  <p className={`text-sm font-bold ${trendColor}`}>
                    {trend === "down" ? "Bajando" : trend === "up" ? "Subiendo" : "Estable"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {trend === "down"
                    ? "Estás perdiendo peso. ¡Sigue así!"
                    : trend === "up"
                      ? "Estás ganando peso. Revisa tu dieta y ejercicio."
                      : "Tu peso se mantiene estable."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle>Evolución de peso</CardTitle>
                <div className="mt-2 sm:mt-0">
                  <Tabs
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as "7d" | "30d" | "90d" | "all")}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="7d" className="text-xs">
                        7D
                      </TabsTrigger>
                      <TabsTrigger value="30d" className="text-xs">
                        30D
                      </TabsTrigger>
                      <TabsTrigger value="90d" className="text-xs">
                        90D
                      </TabsTrigger>
                      <TabsTrigger value="all" className="text-xs">
                        Todo
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[Math.floor(minWeight - 2), Math.ceil(maxWeight + 2)]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="weight"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de peso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{entry.weight.toFixed(1)} kg</div>
                      <div className="text-sm text-muted-foreground">{formatDate(entry.date)}</div>
                      {entry.notes && <div className="text-sm mt-1">{entry.notes}</div>}
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
