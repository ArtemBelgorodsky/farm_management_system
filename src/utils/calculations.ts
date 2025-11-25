import type { CropType, SoilType, Planting, Fertilization, FertilizerRecommendation } from "../types"

// Базовые урожайности культур (т/га)
export const BASE_YIELDS: Record<CropType, number> = {
  Пшеница: 4.0,
  Кукуруза: 7.0,
  Подсолнечник: 2.5,
  Соя: 2.2,
  Рапс: 2.8,
  Ячмень: 3.5,
  Овес: 2.8,
  Горох: 2.0,
}

// Коэффициенты влияния почвы на урожайность
export const SOIL_COEFFICIENTS: Record<SoilType, number> = {
  Чернозем: 1.2,
  Суглинок: 1.0,
  Песчаная: 0.7,
  Глинистая: 0.8,
  Супесчаная: 0.85,
}

// Вегетационный период культур (дни)
export const VEGETATION_PERIODS: Record<CropType, number> = {
  Пшеница: 100,
  Кукуруза: 120,
  Подсолнечник: 110,
  Соя: 95,
  Рапс: 115,
  Ячмень: 85,
  Овес: 90,
  Горох: 75,
}

// Нормы высева (кг/га)
export const SEEDING_RATES: Record<CropType, { min: number; max: number; optimal: number }> = {
  Пшеница: { min: 180, max: 250, optimal: 210 },
  Кукуруза: { min: 15, max: 25, optimal: 20 },
  Подсолнечник: { min: 6, max: 10, optimal: 8 },
  Соя: { min: 80, max: 140, optimal: 110 },
  Рапс: { min: 3, max: 5, optimal: 4 },
  Ячмень: { min: 180, max: 220, optimal: 200 },
  Овес: { min: 150, max: 200, optimal: 180 },
  Горох: { min: 200, max: 300, optimal: 250 },
}

// Расчет ожидаемой урожайности
export function calculateExpectedYield(
  crop: CropType,
  soilType: SoilType,
  seedAmount: number,
  area: number,
  fertilizersApplied: Fertilization[],
): number {
  const baseYield = BASE_YIELDS[crop]
  const soilCoeff = SOIL_COEFFICIENTS[soilType]

  // Коэффициент нормы высева
  const seedingRate = seedAmount / area
  const optimalRate = SEEDING_RATES[crop].optimal
  const seedingCoeff = Math.min(1.1, Math.max(0.7, seedingRate / optimalRate))

  // Коэффициент удобрений (до +30% к урожаю)
  let fertilizerBonus = 1.0
  const fertilizerTypes = new Set(fertilizersApplied.map((f) => f.fertilizerType))

  if (fertilizerTypes.has("Азотные")) fertilizerBonus += 0.1
  if (fertilizerTypes.has("Фосфорные")) fertilizerBonus += 0.08
  if (fertilizerTypes.has("Калийные")) fertilizerBonus += 0.06
  if (fertilizerTypes.has("Комплексные")) fertilizerBonus += 0.12
  if (fertilizerTypes.has("Органические")) fertilizerBonus += 0.05

  fertilizerBonus = Math.min(1.3, fertilizerBonus)

  return Number((baseYield * soilCoeff * seedingCoeff * fertilizerBonus).toFixed(2))
}

// Расчет даты сбора урожая
export function calculateHarvestDate(plantingDate: Date, crop: CropType): Date {
  const days = VEGETATION_PERIODS[crop]
  const harvestDate = new Date(plantingDate)
  harvestDate.setDate(harvestDate.getDate() + days)
  return harvestDate
}

// Генерация рекомендаций по удобрениям
export function generateFertilizerRecommendations(
  crop: CropType,
  soilType: SoilType,
  plantingDate: Date,
  currentFertilizations: Fertilization[],
): FertilizerRecommendation[] {
  const recommendations: FertilizerRecommendation[] = []
  const appliedTypes = new Set(currentFertilizations.map((f) => f.fertilizerType))

  if (!appliedTypes.has("Азотные")) {
    const applicationDate = new Date(plantingDate)
    applicationDate.setDate(applicationDate.getDate() + 30)

    recommendations.push({
      type: "Азотные",
      name: "Аммиачная селитра",
      amount: crop === "Пшеница" ? 150 : crop === "Кукуруза" ? 200 : 120,
      applicationDate,
      expectedEffect: "Увеличение урожайности на 8-12%",
    })
  }

  if (!appliedTypes.has("Фосфорные") && soilType !== "Чернозем") {
    const applicationDate = new Date(plantingDate)
    applicationDate.setDate(applicationDate.getDate() + 45)

    recommendations.push({
      type: "Фосфорные",
      name: "Суперфосфат",
      amount: 100,
      applicationDate,
      expectedEffect: "Укрепление корневой системы, +5-8% к урожаю",
    })
  }

  if (!appliedTypes.has("Калийные") && ["Подсолнечник", "Соя", "Рапс"].includes(crop)) {
    const applicationDate = new Date(plantingDate)
    applicationDate.setDate(applicationDate.getDate() + 60)

    recommendations.push({
      type: "Калийные",
      name: "Хлористый калий",
      amount: 80,
      applicationDate,
      expectedEffect: "Повышение масличности, +4-6% к урожаю",
    })
  }

  return recommendations
}

// Расчет здоровья посева (0-100)
export function calculateHealthScore(planting: Planting, fertilizations: Fertilization[], soilType: SoilType): number {
  let score = 70

  if (soilType === "Чернозем") score += 15
  else if (soilType === "Суглинок") score += 10
  else if (soilType === "Супесчаная") score += 5

  const uniqueFertilizers = new Set(fertilizations.map((f) => f.fertilizerType)).size
  score += uniqueFertilizers * 3

  const seedingRate = planting.seedAmount / planting.plantingArea
  const optimal = SEEDING_RATES[planting.crop].optimal
  const deviation = Math.abs(seedingRate - optimal) / optimal

  if (deviation < 0.1) score += 5
  else if (deviation > 0.3) score -= 10

  return Math.min(100, Math.max(0, score))
}

// Расчет дней до сбора урожая
export function getDaysUntilHarvest(expectedHarvestDate: Date): number {
  const today = new Date()
  const diffTime = expectedHarvestDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
