export interface Profile {
  id: string
  name: string
  sex: 'M' | 'F'
  age: number
  weight_kg: number
  height_cm: number
  goal: 'lose' | 'maintain' | 'gain'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  daily_kcal_goal: number
  daily_protein_goal: number
  daily_carb_goal: number
  daily_fat_goal: number
}

export interface MealItem {
  id: string
  meal_id: string
  food_name: string
  quantity_g: number
  kcal: number
  protein_g: number
  carb_g: number
  fat_g: number
  source: string
}

export interface Meal {
  id: string
  user_id: string
  meal_type: 'cafe' | 'almoco' | 'jantar' | 'lanche'
  description: string
  image_url: string | null
  total_kcal: number
  total_protein_g: number
  total_carb_g: number
  total_fat_g: number
  confidence: number
  logged_at: string
  meal_items?: MealItem[]
}

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
}

export interface WeightLog {
  id: string
  user_id: string
  weight_kg: number
  logged_at: string
}

export interface DailySummary {
  total_kcal: number
  total_protein_g: number
  total_carb_g: number
  total_fat_g: number
  total_water_ml: number
  meals: Meal[]
}

export interface GeminiResult {
  items: {
    food_name: string
    quantity_g: number
    kcal: number
    protein_g: number
    carb_g: number
    fat_g: number
  }[]
  total_kcal: number
  total_protein_g: number
  total_carb_g: number
  total_fat_g: number
  confidence: number
  notes: string
}
