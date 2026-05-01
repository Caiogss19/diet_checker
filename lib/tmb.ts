interface TmbInput {
  weight_kg: number
  height_cm: number
  age: number
  sex: 'M' | 'F'
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
  goal: 'lose' | 'maintain' | 'gain'
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

export function calcMetas(p: TmbInput) {
  const tmb =
    p.sex === 'M'
      ? 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + 5
      : 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age - 161

  const tdee = tmb * ACTIVITY_FACTORS[p.activity_level]

  const kcal =
    p.goal === 'lose' ? tdee - 500 : p.goal === 'gain' ? tdee + 300 : tdee

  return {
    daily_kcal_goal: Math.round(kcal),
    daily_protein_goal: Math.round(p.weight_kg * 2),
    daily_carb_goal: Math.round((kcal * 0.45) / 4),
    daily_fat_goal: Math.round((kcal * 0.25) / 9),
  }
}
