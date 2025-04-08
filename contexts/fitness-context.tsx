"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import type {
  Workout,
  WeightEntry,
  BodyMeasurement,
  Goal,
  WorkoutRoutine,
  NutritionEntry,
  ExerciseCategory,
} from "../lib/types"
import { defaultRoutines } from "../lib/default-data"

interface FitnessContextType {
  // Workouts
  workouts: Workout[]
  addWorkout: (workout: Omit<Workout, "id" | "date">) => void
  deleteWorkout: (id: string) => void
  currentWorkout: Partial<Workout> | null
  updateCurrentWorkout: (workout: Partial<Workout>) => void
  clearCurrentWorkout: () => void

  // Weight
  weightEntries: WeightEntry[]
  addWeightEntry: (weight: number) => void
  deleteWeightEntry: (id: string) => void

  // Body measurements
  bodyMeasurements: BodyMeasurement[]
  addBodyMeasurement: (measurement: Omit<BodyMeasurement, "id" | "date">) => void
  deleteBodyMeasurement: (id: string) => void

  // Goals
  goals: Goal[]
  addGoal: (goal: Omit<Goal, "id" | "createdAt" | "progress" | "completed">) => void
  updateGoalProgress: (id: string, progress: number) => void
  completeGoal: (id: string) => void
  deleteGoal: (id: string) => void

  // Routines
  routines: WorkoutRoutine[]
  addRoutine: (routine: Omit<WorkoutRoutine, "id">) => void
  deleteRoutine: (id: string) => void

  // Nutrition
  nutritionEntries: NutritionEntry[]
  addNutritionEntry: (entry: Omit<NutritionEntry, "id" | "date">) => void
  deleteNutritionEntry: (id: string) => void

  // Exercise categories
  exerciseCategories: ExerciseCategory[]
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined)

export function FitnessProvider({ children }: { children: ReactNode }) {
  // Workouts state
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [currentWorkout, setCurrentWorkout] = useState<Partial<Workout> | null>(null)

  // Weight state
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])

  // Body measurements state
  const [bodyMeasurements, setBodyMeasurements] = useState<BodyMeasurement[]>([])

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([])

  // Routines state
  const [routines, setRoutines] = useState<WorkoutRoutine[]>([])

  // Nutrition state
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>([])

  // Exercise categories
  const [exerciseCategories, setExerciseCategories] = useState<ExerciseCategory[]>([
    { id: "chest", name: "Pecho", icon: "dumbbell" },
    { id: "back", name: "Espalda", icon: "dumbbell" },
    { id: "legs", name: "Piernas", icon: "dumbbell" },
    { id: "shoulders", name: "Hombros", icon: "dumbbell" },
    { id: "arms", name: "Brazos", icon: "dumbbell" },
    { id: "abs", name: "Abdominales", icon: "dumbbell" },
    { id: "cardio", name: "Cardio", icon: "heart" },
  ])

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      // Load workouts
      const savedWorkouts = localStorage.getItem("workouts")
      if (savedWorkouts) {
        setWorkouts(JSON.parse(savedWorkouts))
      }

      // Load current workout
      const savedCurrentWorkout = localStorage.getItem("currentWorkout")
      if (savedCurrentWorkout) {
        setCurrentWorkout(JSON.parse(savedCurrentWorkout))
      }

      // Load weight entries
      const savedWeightEntries = localStorage.getItem("weightEntries")
      if (savedWeightEntries) {
        setWeightEntries(JSON.parse(savedWeightEntries))
      }

      // Load body measurements
      const savedBodyMeasurements = localStorage.getItem("bodyMeasurements")
      if (savedBodyMeasurements) {
        setBodyMeasurements(JSON.parse(savedBodyMeasurements))
      }

      // Load goals
      const savedGoals = localStorage.getItem("goals")
      if (savedGoals) {
        setGoals(JSON.parse(savedGoals))
      }

      // Load routines or set defaults
      const savedRoutines = localStorage.getItem("routines")
      if (savedRoutines) {
        setRoutines(JSON.parse(savedRoutines))
      } else {
        setRoutines(defaultRoutines)
        localStorage.setItem("routines", JSON.stringify(defaultRoutines))
      }

      // Load nutrition entries
      const savedNutritionEntries = localStorage.getItem("nutritionEntries")
      if (savedNutritionEntries) {
        setNutritionEntries(JSON.parse(savedNutritionEntries))
      }
    }

    loadData()
  }, [])

  // Workouts functions
  const addWorkout = (workout: Omit<Workout, "id" | "date">) => {
    const newWorkout: Workout = {
      ...workout,
      id: uuidv4(),
      date: new Date().toISOString(),
    }

    const updatedWorkouts = [...workouts, newWorkout]
    setWorkouts(updatedWorkouts)
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))

    // Clear current workout
    setCurrentWorkout(null)
    localStorage.removeItem("currentWorkout")
  }

  const deleteWorkout = (id: string) => {
    const updatedWorkouts = workouts.filter((workout) => workout.id !== id)
    setWorkouts(updatedWorkouts)
    localStorage.setItem("workouts", JSON.stringify(updatedWorkouts))
  }

  const updateCurrentWorkout = (workout: Partial<Workout>) => {
    const updated = { ...currentWorkout, ...workout }
    setCurrentWorkout(updated)
    localStorage.setItem("currentWorkout", JSON.stringify(updated))
  }

  const clearCurrentWorkout = () => {
    setCurrentWorkout(null)
    localStorage.removeItem("currentWorkout")
  }

  // Weight functions
  const addWeightEntry = (weight: number) => {
    const newEntry: WeightEntry = {
      id: uuidv4(),
      date: new Date().toISOString(),
      weight,
    }

    const updatedEntries = [...weightEntries, newEntry]
    updatedEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    setWeightEntries(updatedEntries)
    localStorage.setItem("weightEntries", JSON.stringify(updatedEntries))
  }

  const deleteWeightEntry = (id: string) => {
    const updatedEntries = weightEntries.filter((entry) => entry.id !== id)
    setWeightEntries(updatedEntries)
    localStorage.setItem("weightEntries", JSON.stringify(updatedEntries))
  }

  // Body measurements functions
  const addBodyMeasurement = (measurement: Omit<BodyMeasurement, "id" | "date">) => {
    const newMeasurement: BodyMeasurement = {
      ...measurement,
      id: uuidv4(),
      date: new Date().toISOString(),
    }

    const updatedMeasurements = [...bodyMeasurements, newMeasurement]
    setBodyMeasurements(updatedMeasurements)
    localStorage.setItem("bodyMeasurements", JSON.stringify(updatedMeasurements))
  }

  const deleteBodyMeasurement = (id: string) => {
    const updatedMeasurements = bodyMeasurements.filter((m) => m.id !== id)
    setBodyMeasurements(updatedMeasurements)
    localStorage.setItem("bodyMeasurements", JSON.stringify(updatedMeasurements))
  }

  // Goals functions
  const addGoal = (goal: Omit<Goal, "id" | "createdAt" | "progress" | "completed">) => {
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      progress: 0,
      completed: false,
    }

    const updatedGoals = [...goals, newGoal]
    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))
  }

  const updateGoalProgress = (id: string, progress: number) => {
    const updatedGoals = goals.map((goal) => (goal.id === id ? { ...goal, progress: Math.min(progress, 100) } : goal))
    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))
  }

  const completeGoal = (id: string) => {
    const updatedGoals = goals.map((goal) => (goal.id === id ? { ...goal, completed: true, progress: 100 } : goal))
    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))
  }

  const deleteGoal = (id: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== id)
    setGoals(updatedGoals)
    localStorage.setItem("goals", JSON.stringify(updatedGoals))
  }

  // Routines functions
  const addRoutine = (routine: Omit<WorkoutRoutine, "id">) => {
    const newRoutine: WorkoutRoutine = {
      ...routine,
      id: uuidv4(),
    }

    const updatedRoutines = [...routines, newRoutine]
    setRoutines(updatedRoutines)
    localStorage.setItem("routines", JSON.stringify(updatedRoutines))
  }

  const deleteRoutine = (id: string) => {
    const updatedRoutines = routines.filter((routine) => routine.id !== id)
    setRoutines(updatedRoutines)
    localStorage.setItem("routines", JSON.stringify(updatedRoutines))
  }

  // Nutrition functions
  const addNutritionEntry = (entry: Omit<NutritionEntry, "id" | "date">) => {
    const newEntry: NutritionEntry = {
      ...entry,
      id: uuidv4(),
      date: new Date().toISOString(),
    }

    const updatedEntries = [...nutritionEntries, newEntry]
    setNutritionEntries(updatedEntries)
    localStorage.setItem("nutritionEntries", JSON.stringify(updatedEntries))
  }

  const deleteNutritionEntry = (id: string) => {
    const updatedEntries = nutritionEntries.filter((entry) => entry.id !== id)
    setNutritionEntries(updatedEntries)
    localStorage.setItem("nutritionEntries", JSON.stringify(updatedEntries))
  }

  const value = {
    // Workouts
    workouts,
    addWorkout,
    deleteWorkout,
    currentWorkout,
    updateCurrentWorkout,
    clearCurrentWorkout,

    // Weight
    weightEntries,
    addWeightEntry,
    deleteWeightEntry,

    // Body measurements
    bodyMeasurements,
    addBodyMeasurement,
    deleteBodyMeasurement,

    // Goals
    goals,
    addGoal,
    updateGoalProgress,
    completeGoal,
    deleteGoal,

    // Routines
    routines,
    addRoutine,
    deleteRoutine,

    // Nutrition
    nutritionEntries,
    addNutritionEntry,
    deleteNutritionEntry,

    // Exercise categories
    exerciseCategories,
  }

  return <FitnessContext.Provider value={value}>{children}</FitnessContext.Provider>
}

export function useFitness() {
  const context = useContext(FitnessContext)
  if (context === undefined) {
    throw new Error("useFitness must be used within a FitnessProvider")
  }
  return context
}
