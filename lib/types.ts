// Ejercicio
export interface Exercise {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
  restTime?: number // tiempo de descanso en segundos
  notes?: string
  categoryId?: string
}

// Entrenamiento
export interface Workout {
  id: string
  date: string
  name: string
  exercises: Exercise[]
  duration?: number // duración en minutos
  caloriesBurned?: number
  notes?: string
  rating?: number // valoración del 1-5
}

// Entrada de peso
export interface WeightEntry {
  id: string
  date: string
  weight: number
  notes?: string
}

// Medidas corporales
export interface BodyMeasurement {
  id: string
  date: string
  chest?: number
  waist?: number
  hips?: number
  thighs?: number
  arms?: number
  shoulders?: number
  bodyFat?: number
  notes?: string
}

// Objetivos
export interface Goal {
  id: string
  title: string
  description?: string
  targetDate?: string
  type: "weight" | "strength" | "endurance" | "habit" | "custom"
  targetValue?: number
  unit?: string
  progress: number // 0-100
  completed: boolean
  createdAt: string
}

// Rutinas de entrenamiento
export interface WorkoutRoutine {
  id: string
  name: string
  description?: string
  exercises: Exercise[]
  frequency?: string[] // días de la semana
  duration?: number // duración estimada en minutos
  level: "beginner" | "intermediate" | "advanced"
  category?: string
}

// Entrada de nutrición
export interface NutritionEntry {
  id: string
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
  water: number
  mealType?: "breakfast" | "lunch" | "dinner" | "snack"
  foods?: string[]
  notes?: string
}

// Categoría de ejercicio
export interface ExerciseCategory {
  id: string
  name: string
  icon: string
}

// Configuración de usuario
export interface UserSettings {
  name?: string
  age?: number
  gender?: "male" | "female" | "other"
  height?: number
  weightUnit: "kg" | "lb"
  heightUnit: "cm" | "in"
  calorieGoal?: number
  proteinGoal?: number
  carbsGoal?: number
  fatGoal?: number
  waterGoal?: number
  darkMode: boolean
}

