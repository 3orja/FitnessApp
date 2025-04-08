"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { Save, Trash2, AlertTriangle, Moon } from "lucide-react"

interface UserSettings {
  name: string
  age: number
  gender: string
  height: number
  weightUnit: string
  heightUnit: string
  calorieGoal: number
  proteinGoal: number
  carbsGoal: number
  fatGoal: number
  waterGoal: number
}

export default function Settings() {
  // Simulamos la configuración del usuario
  const [userSettings, setUserSettings] = useState<UserSettings>({
    name: "Usuario",
    age: 30,
    gender: "male",
    height: 175,
    weightUnit: "kg",
    heightUnit: "cm",
    calorieGoal: 2000,
    proteinGoal: 150,
    carbsGoal: 200,
    fatGoal: 70,
    waterGoal: 2.5,
  })

  const { theme, setTheme } = useTheme()

  const handleInputChange = (field: string, value: string | number) => {
    setUserSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Corregir la función saveSettings para usar la API correcta de sonner
  const saveSettings = () => {
    // Aquí guardaríamos la configuración en el contexto
    // Por ahora solo mostramos un toast
    toast.success("Configuración guardada", {
      description: "Tus preferencias han sido actualizadas correctamente",
    })
  }

  // Corregir la función clearAllData para usar la API correcta de sonner
  const clearAllData = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.")) {
      // Aquí limpiaríamos todos los datos
      localStorage.clear()

      toast.success("Datos eliminados", {
        description: "Todos tus datos han sido eliminados correctamente",
      })

      // Recargar la página para reiniciar la aplicación
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil de usuario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={userSettings.name} onChange={(e) => handleInputChange("name", e.target.value)} />
            </div>

            <div>
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={userSettings.age}
                onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="gender">Género</Label>
              <Select value={userSettings.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Seleccionar género" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Masculino</SelectItem>
                  <SelectItem value="female">Femenino</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="height">Altura ({userSettings.heightUnit})</Label>
              <Input
                id="height"
                type="number"
                min="1"
                value={userSettings.height}
                onChange={(e) => handleInputChange("height", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weightUnit">Unidad de peso</Label>
              <Select value={userSettings.weightUnit} onValueChange={(value) => handleInputChange("weightUnit", value)}>
                <SelectTrigger id="weightUnit">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilogramos (kg)</SelectItem>
                  <SelectItem value="lb">Libras (lb)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="heightUnit">Unidad de altura</Label>
              <Select value={userSettings.heightUnit} onValueChange={(value) => handleInputChange("heightUnit", value)}>
                <SelectTrigger id="heightUnit">
                  <SelectValue placeholder="Seleccionar unidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">Centímetros (cm)</SelectItem>
                  <SelectItem value="in">Pulgadas (in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Objetivos nutricionales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calorieGoal">Calorías diarias</Label>
              <Input
                id="calorieGoal"
                type="number"
                min="0"
                value={userSettings.calorieGoal}
                onChange={(e) => handleInputChange("calorieGoal", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="waterGoal">Agua diaria (litros)</Label>
              <Input
                id="waterGoal"
                type="number"
                min="0"
                step="0.1"
                value={userSettings.waterGoal}
                onChange={(e) => handleInputChange("waterGoal", Number.parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="proteinGoal">Proteínas (g)</Label>
              <Input
                id="proteinGoal"
                type="number"
                min="0"
                value={userSettings.proteinGoal}
                onChange={(e) => handleInputChange("proteinGoal", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="carbsGoal">Carbohidratos (g)</Label>
              <Input
                id="carbsGoal"
                type="number"
                min="0"
                value={userSettings.carbsGoal}
                onChange={(e) => handleInputChange("carbsGoal", Number.parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="fatGoal">Grasas (g)</Label>
              <Input
                id="fatGoal"
                type="number"
                min="0"
                value={userSettings.fatGoal}
                onChange={(e) => handleInputChange("fatGoal", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Apariencia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <Label htmlFor="darkMode">Modo oscuro</Label>
            </div>
            <Switch
              id="darkMode"
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos y privacidad</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">
              Todos tus datos se almacenan localmente en tu dispositivo. No se envían a ningún servidor.
            </p>

            <div className="border rounded-lg p-4 bg-destructive/10 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
              <div>
                <h4 className="font-medium text-destructive">Eliminar todos los datos</h4>
                <p className="text-sm text-muted-foreground">
                  Esta acción eliminará permanentemente todos tus datos de entrenamiento, peso, medidas y objetivos.
                </p>
                <Button variant="destructive" size="sm" className="mt-2" onClick={clearAllData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar todos los datos
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveSettings} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Guardar configuración
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
