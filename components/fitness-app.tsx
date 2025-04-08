"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeProvider } from "../components/theme-provider"
import { ThemeToggle } from "./theme-toggle"
import Dashboard from "./dashboard"
import WorkoutTracker from "./workout-tracker"
import WeightTracker from "./weight-tracker"
import WorkoutHistory from "./workout-history"
import BodyMeasurements from "./body-measurements"
import Goals from "./goals"
import Routines from "./routines"
import Nutrition from "./nutrition"
import Settings from "./settings"
import {
  Dumbbell,
  LineChart,
  History,
  LayoutDashboard,
  Ruler,
  Target,
  ListChecks,
  Apple,
  Settings2,
} from "lucide-react"
import { FitnessProvider } from "../contexts/fitness-context"

export default function FitnessApp() {
  const [mounted, setMounted] = useState(false)

  // Ensure hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FitnessProvider>
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold text-primary">FitTrack Pro</h1>
                </div>
                <ThemeToggle />
              </div>
              <p className="text-muted-foreground">Tu entrenador personal digital</p>
            </CardContent>
          </Card>

          <Tabs defaultValue="dashboard" className="w-full">
            <div className="mb-8 overflow-x-auto">
              <TabsList className="grid min-w-max grid-cols-9">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger value="workout" className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">Entrenamiento</span>
                </TabsTrigger>
                <TabsTrigger value="weight" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span className="hidden sm:inline">Peso</span>
                </TabsTrigger>
                <TabsTrigger value="body" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  <span className="hidden sm:inline">Medidas</span>
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Objetivos</span>
                </TabsTrigger>
                <TabsTrigger value="routines" className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Rutinas</span>
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center gap-2">
                  <Apple className="h-4 w-4" />
                  <span className="hidden sm:inline">Nutrición</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajustes</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">Historial</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>

            <TabsContent value="workout">
              <WorkoutTracker />
            </TabsContent>

            <TabsContent value="weight">
              <WeightTracker />
            </TabsContent>

            <TabsContent value="body">
              <BodyMeasurements />
            </TabsContent>

            <TabsContent value="goals">
              <Goals />
            </TabsContent>

            <TabsContent value="routines">
              <Routines />
            </TabsContent>

            <TabsContent value="nutrition">
              <Nutrition />
            </TabsContent>

            <TabsContent value="settings">
              <Settings />
            </TabsContent>

            <TabsContent value="history">
              <WorkoutHistory />
            </TabsContent>
          </Tabs>
        </div>
      </FitnessProvider>
    </ThemeProvider>
  )
}

