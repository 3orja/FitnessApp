"use client"

import { useState } from "react"
import { useFitness } from "../contexts/fitness-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"
import { format, parseISO, subDays } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"

export default function BodyMeasurements() {
  const { bodyMeasurements, addBodyMeasurement, deleteBodyMeasurement } = useFitness()
  const [measurements, setMeasurements] = useState({
    chest: "",
    waist: "",
    hips: "",
    thighs: "",
    arms: "",
    shoulders: "",
    bodyFat: "",
  })
  const [timeRange, setTimeRange] = useState<"30d" | "90d" | "all">("30d")
  const [selectedMeasurement, setSelectedMeasurement] = useState<string>("waist")

  const handleInputChange = (field: string, value: string) => {
    setMeasurements((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleAddMeasurements = () => {
    // Verificar que al menos un campo tenga valor
    const hasValue = Object.values(measurements).some((val) => val !== "")

    if (!hasValue) {
      toast.error("Error", {
        description: "Por favor, introduce al menos una medida",
      })
      return
    }

    // Convertir valores a números
    const numericMeasurements: Record<string, number | undefined> = {}

    Object.entries(measurements).forEach(([key, value]) => {
      numericMeasurements[key] = value ? Number.parseFloat(value) : undefined
    })

    addBodyMeasurement(numericMeasurements)

    // Limpiar formulario
    setMeasurements({
      chest: "",
      waist: "",
      hips: "",
      thighs: "",
      arms: "",
      shoulders: "",
      bodyFat: "",
    })

    toast.success("Medidas registradas", {
      description: "Tus medidas corporales han sido registradas correctamente",
    })
  }

  const handleDeleteMeasurement = (id: string) => {
    deleteBodyMeasurement(id)

    toast.success("Medidas eliminadas", {
      description: "Las medidas corporales han sido eliminadas correctamente",
    })
  }

  const formatDate = (dateString: string, short = false) => {
    return format(parseISO(dateString), short ? "dd MMM" : "dd MMMM yyyy, HH:mm", { locale: es })
  }

  // Ordenar medidas por fecha (más reciente primero)
  const sortedMeasurements = [...bodyMeasurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  // Preparar datos para el gráfico
  const getChartData = () => {
    if (sortedMeasurements.length === 0) return []

    // Ordenar por fecha ascendente para el gráfico
    const chronologicalMeasurements = [...sortedMeasurements].reverse()

    // Filtrar por rango de tiempo
    const today = new Date()
    let startDate: Date

    switch (timeRange) {
      case "30d":
        startDate = subDays(today, 30)
        break
      case "90d":
        startDate = subDays(today, 90)
        break
      default:
        startDate = new Date(0) // Todas las entradas
    }

    const filteredMeasurements = chronologicalMeasurements.filter((entry) => parseISO(entry.date) >= startDate)

    return filteredMeasurements.map((entry) => ({
      date: formatDate(entry.date, true),
      chest: entry.chest,
      waist: entry.waist,
      hips: entry.hips,
      thighs: entry.thighs,
      arms: entry.arms,
      shoulders: entry.shoulders,
      bodyFat: entry.bodyFat,
    }))
  }

  const chartData = getChartData()

  // Preparar datos para el gráfico de radar
  const getRadarData = () => {
    if (sortedMeasurements.length === 0) return []

    // Usar la medida más reciente
    const latest = sortedMeasurements[0]

    // Si hay al menos dos medidas, comparar con la anterior
    const previous = sortedMeasurements.length > 1 ? sortedMeasurements[1] : null

    return [
      { subject: "Pecho", current: latest.chest || 0, previous: previous?.chest || 0 },
      { subject: "Cintura", current: latest.waist || 0, previous: previous?.waist || 0 },
      { subject: "Caderas", current: latest.hips || 0, previous: previous?.hips || 0 },
      { subject: "Muslos", current: latest.thighs || 0, previous: previous?.thighs || 0 },
      { subject: "Brazos", current: latest.arms || 0, previous: previous?.arms || 0 },
      { subject: "Hombros", current: latest.shoulders || 0, previous: previous?.shoulders || 0 },
    ]
  }

  const radarData = getRadarData()

  // Obtener la última medida
  const latestMeasurement = sortedMeasurements.length > 0 ? sortedMeasurements[0] : null

  // Obtener la medida anterior para comparar
  const previousMeasurement = sortedMeasurements.length > 1 ? sortedMeasurements[1] : null

  // Calcular cambios
  const getChange = (current?: number, previous?: number) => {
    if (current === undefined || previous === undefined) return null
    return current - previous
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Registrar medidas corporales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Pecho (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Pecho"
                value={measurements.chest}
                onChange={(e) => handleInputChange("chest", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cintura (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Cintura"
                value={measurements.waist}
                onChange={(e) => handleInputChange("waist", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Caderas (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Caderas"
                value={measurements.hips}
                onChange={(e) => handleInputChange("hips", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Muslos (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Muslos"
                value={measurements.thighs}
                onChange={(e) => handleInputChange("thighs", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Brazos (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Brazos"
                value={measurements.arms}
                onChange={(e) => handleInputChange("arms", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hombros (cm)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="Hombros"
                value={measurements.shoulders}
                onChange={(e) => handleInputChange("shoulders", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Grasa corporal (%)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="% Grasa"
                value={measurements.bodyFat}
                onChange={(e) => handleInputChange("bodyFat", e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handleAddMeasurements} className="w-full mt-6">
            Registrar medidas
          </Button>
        </CardContent>
      </Card>

      {sortedMeasurements.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Comparación de medidas</CardTitle>
            </CardHeader>
            <CardContent>
              {latestMeasurement && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h3 className="text-sm font-medium mb-2">Medidas actuales</h3>
                      <div className="space-y-2 text-sm">
                        {latestMeasurement.chest !== undefined && (
                          <div className="flex justify-between">
                            <span>Pecho:</span>
                            <span className="font-medium">{latestMeasurement.chest} cm</span>
                          </div>
                        )}
                        {latestMeasurement.waist !== undefined && (
                          <div className="flex justify-between">
                            <span>Cintura:</span>
                            <span className="font-medium">{latestMeasurement.waist} cm</span>
                          </div>
                        )}
                        {latestMeasurement.hips !== undefined && (
                          <div className="flex justify-between">
                            <span>Caderas:</span>
                            <span className="font-medium">{latestMeasurement.hips} cm</span>
                          </div>
                        )}
                        {latestMeasurement.thighs !== undefined && (
                          <div className="flex justify-between">
                            <span>Muslos:</span>
                            <span className="font-medium">{latestMeasurement.thighs} cm</span>
                          </div>
                        )}
                        {latestMeasurement.arms !== undefined && (
                          <div className="flex justify-between">
                            <span>Brazos:</span>
                            <span className="font-medium">{latestMeasurement.arms} cm</span>
                          </div>
                        )}
                        {latestMeasurement.shoulders !== undefined && (
                          <div className="flex justify-between">
                            <span>Hombros:</span>
                            <span className="font-medium">{latestMeasurement.shoulders} cm</span>
                          </div>
                        )}
                        {latestMeasurement.bodyFat !== undefined && (
                          <div className="flex justify-between">
                            <span>Grasa corporal:</span>
                            <span className="font-medium">{latestMeasurement.bodyFat}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {previousMeasurement && (
                      <div className="border rounded-lg p-4">
                        <h3 className="text-sm font-medium mb-2">Cambios desde última medición</h3>
                        <div className="space-y-2 text-sm">
                          {latestMeasurement.chest !== undefined && previousMeasurement.chest !== undefined && (
                            <div className="flex justify-between">
                              <span>Pecho:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.chest, previousMeasurement.chest)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.chest, previousMeasurement.chest)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.chest, previousMeasurement.chest)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.waist !== undefined && previousMeasurement.waist !== undefined && (
                            <div className="flex justify-between">
                              <span>Cintura:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.waist, previousMeasurement.waist)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.waist, previousMeasurement.waist)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.waist, previousMeasurement.waist)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.hips !== undefined && previousMeasurement.hips !== undefined && (
                            <div className="flex justify-between">
                              <span>Caderas:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.hips, previousMeasurement.hips)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.hips, previousMeasurement.hips)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.hips, previousMeasurement.hips)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.thighs !== undefined && previousMeasurement.thighs !== undefined && (
                            <div className="flex justify-between">
                              <span>Muslos:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.thighs, previousMeasurement.thighs)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.thighs, previousMeasurement.thighs)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.thighs, previousMeasurement.thighs)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.arms !== undefined && previousMeasurement.arms !== undefined && (
                            <div className="flex justify-between">
                              <span>Brazos:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.arms, previousMeasurement.arms)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.arms, previousMeasurement.arms)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.arms, previousMeasurement.arms)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.shoulders !== undefined && previousMeasurement.shoulders !== undefined && (
                            <div className="flex justify-between">
                              <span>Hombros:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.shoulders, previousMeasurement.shoulders)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.shoulders, previousMeasurement.shoulders)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.shoulders, previousMeasurement.shoulders)} cm
                              </span>
                            </div>
                          )}
                          {latestMeasurement.bodyFat !== undefined && previousMeasurement.bodyFat !== undefined && (
                            <div className="flex justify-between">
                              <span>Grasa corporal:</span>
                              <span
                                className={`font-medium ${getChange(latestMeasurement.bodyFat, previousMeasurement.bodyFat)! < 0 ? "text-green-500" : "text-red-500"}`}
                              >
                                {getChange(latestMeasurement.bodyFat, previousMeasurement.bodyFat)! > 0 ? "+" : ""}
                                {getChange(latestMeasurement.bodyFat, previousMeasurement.bodyFat)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {radarData.length > 0 && (
                    <div className="h-[300px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis />
                          <Radar name="Actual" dataKey="current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          {previousMeasurement && (
                            <Radar
                              name="Anterior"
                              dataKey="previous"
                              stroke="#82ca9d"
                              fill="#82ca9d"
                              fillOpacity={0.3}
                            />
                          )}
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <CardTitle>Evolución de medidas</CardTitle>
                <div className="mt-2 sm:mt-0">
                  <Tabs
                    value={timeRange}
                    onValueChange={(value) => setTimeRange(value as "30d" | "90d" | "all")}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-3 w-full">
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
              <div className="mb-4">
                <Tabs value={selectedMeasurement} onValueChange={setSelectedMeasurement} className="w-full">
                  <TabsList className="grid grid-cols-3 sm:grid-cols-7 w-full">
                    <TabsTrigger value="chest" className="text-xs">
                      Pecho
                    </TabsTrigger>
                    <TabsTrigger value="waist" className="text-xs">
                      Cintura
                    </TabsTrigger>
                    <TabsTrigger value="hips" className="text-xs">
                      Caderas
                    </TabsTrigger>
                    <TabsTrigger value="thighs" className="text-xs">
                      Muslos
                    </TabsTrigger>
                    <TabsTrigger value="arms" className="text-xs">
                      Brazos
                    </TabsTrigger>
                    <TabsTrigger value="shoulders" className="text-xs">
                      Hombros
                    </TabsTrigger>
                    <TabsTrigger value="bodyFat" className="text-xs">
                      Grasa
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey={selectedMeasurement}
                      stroke="#8884d8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de medidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sortedMeasurements.map((measurement) => (
                  <div key={measurement.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{formatDate(measurement.date)}</div>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteMeasurement(measurement.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
                      {measurement.chest !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Pecho:</span> {measurement.chest} cm
                        </div>
                      )}
                      {measurement.waist !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Cintura:</span> {measurement.waist} cm
                        </div>
                      )}
                      {measurement.hips !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Caderas:</span> {measurement.hips} cm
                        </div>
                      )}
                      {measurement.thighs !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Muslos:</span> {measurement.thighs} cm
                        </div>
                      )}
                      {measurement.arms !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Brazos:</span> {measurement.arms} cm
                        </div>
                      )}
                      {measurement.shoulders !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Hombros:</span> {measurement.shoulders} cm
                        </div>
                      )}
                      {measurement.bodyFat !== undefined && (
                        <div>
                          <span className="text-muted-foreground">Grasa:</span> {measurement.bodyFat}%
                        </div>
                      )}
                    </div>
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
