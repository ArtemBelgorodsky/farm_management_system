import type { CropType, SoilType, Field, Planting, Harvest, Recommendation, CropRotationRule, Fertilization } from "../types"
import { BASE_YIELDS, SOIL_COEFFICIENTS } from "./calculations"

// Правила севооборота - что за чем можно сажать
export const CROP_ROTATION_RULES: Record<CropType, CropRotationRule> = {
  Пшеница: {
    crop: "Пшеница",
    goodPredecessors: ["Горох", "Соя", "Рапс", "Кукуруза"],
    badPredecessors: ["Пшеница", "Ячмень", "Овес"],
    restPeriod: 2,
    soilRestoration: 70,
  },
  Кукуруза: {
    crop: "Кукуруза",
    goodPredecessors: ["Пшеница", "Соя", "Горох", "Рапс"],
    badPredecessors: ["Подсолнечник"],
    restPeriod: 1,
    soilRestoration: 60,
  },
  Подсолнечник: {
    crop: "Подсолнечник",
    goodPredecessors: ["Пшеница", "Ячмень", "Кукуруза"],
    badPredecessors: ["Подсолнечник", "Рапс", "Соя"],
    restPeriod: 7,
    soilRestoration: 40,
  },
  Соя: {
    crop: "Соя",
    goodPredecessors: ["Пшеница", "Кукуруза", "Ячмень"],
    badPredecessors: ["Соя", "Горох", "Подсолнечник"],
    restPeriod: 3,
    soilRestoration: 90,
  },
  Рапс: {
    crop: "Рапс",
    goodPredecessors: ["Пшеница", "Ячмень", "Горох"],
    badPredecessors: ["Рапс", "Подсолнечник", "Соя"],
    restPeriod: 4,
    soilRestoration: 75,
  },
  Ячмень: {
    crop: "Ячмень",
    goodPredecessors: ["Горох", "Соя", "Кукуруза", "Рапс"],
    badPredecessors: ["Ячмень", "Пшеница", "Овес"],
    restPeriod: 2,
    soilRestoration: 65,
  },
  Овес: {
    crop: "Овес",
    goodPredecessors: ["Горох", "Соя", "Кукуруза"],
    badPredecessors: ["Овес", "Ячмень", "Пшеница"],
    restPeriod: 2,
    soilRestoration: 70,
  },
  Горох: {
    crop: "Горох",
    goodPredecessors: ["Пшеница", "Ячмень", "Кукуруза", "Овес"],
    badPredecessors: ["Горох", "Соя"],
    restPeriod: 4,
    soilRestoration: 95,
  },
}

// Рентабельность культур (примерная в %)
const CROP_PROFITABILITY: Record<CropType, number> = {
  Пшеница: 25,
  Кукуруза: 35,
  Подсолнечник: 45,
  Соя: 40,
  Рапс: 38,
  Ячмень: 20,
  Овес: 18,
  Горох: 30,
}

// Оптимальные типы почв для культур
const OPTIMAL_SOIL_FOR_CROP: Record<CropType, SoilType[]> = {
  Пшеница: ["Чернозем", "Суглинок"],
  Кукуруза: ["Чернозем", "Суглинок"],
  Подсолнечник: ["Чернозем", "Суглинок", "Супесчаная"],
  Соя: ["Чернозем", "Суглинок"],
  Рапс: ["Чернозем", "Суглинок"],
  Ячмень: ["Чернозем", "Суглинок", "Супесчаная"],
  Овес: ["Суглинок", "Супесчаная", "Песчаная"],
  Горох: ["Чернозем", "Суглинок"],
}

export interface FieldRecommendation extends Recommendation {
  fieldName: string
  previousCrop: CropType | null
  soilType: SoilType
  yearsWithoutRest: number
  needsRest: boolean
  restRecommendation: string
  alternativeCrops: {
    crop: CropType
    reason: string
    expectedYield: number
  }[]
}

export interface GeneralRecommendation {
  title: string
  description: string
  priority: "high" | "medium" | "low"
  category: "rotation" | "fertilizer" | "soil" | "timing"
}

// Получение истории посевов для поля
export function getFieldHistory(
  fieldId: string,
  plantings: Planting[],
  harvests: Harvest[],
): { crop: CropType; year: number; yield: number }[] {
  const fieldPlantings = plantings.filter((p) => p.fieldId === fieldId)

  return fieldPlantings
    .map((p) => {
      const harvest = harvests.find((h) => h.plantingId === p.id)
      return {
        crop: p.crop,
        year: p.plantingDate.getFullYear(),
        yield: harvest?.actualYield || 0,
      }
    })
    .sort((a, b) => b.year - a.year)
}

// Расчет количества лет без отдыха
function calculateYearsWithoutRest(fieldHistory: { crop: CropType; year: number; yield?: number }[]): number {
  if (fieldHistory.length === 0) return 0

  const currentYear = new Date().getFullYear()
  const lastYear = fieldHistory[0]?.year || currentYear

  return currentYear - lastYear
}

// Проверка нужен ли отдых полю
function needsFieldRest(yearsWithoutRest: number, lastCrop: CropType | null): boolean {
  if (!lastCrop) return false

  // Если поле использовалось более 5 лет подряд
  if (yearsWithoutRest >= 5) return true

  // Если последняя культура сильно истощает почву
  const rule = CROP_ROTATION_RULES[lastCrop]
  if (rule.soilRestoration < 50 && yearsWithoutRest >= 3) return true

  return false
}

// Генерация рекомендации для конкретного поля
export function generateFieldRecommendation(
  field: Field,
  plantings: Planting[],
  harvests: Harvest[],
): FieldRecommendation {
  // Защита от undefined параметров
  if (!plantings) plantings = []
  if (!harvests) harvests = []

  const history = getFieldHistory(field.id, plantings, harvests)
  const lastCrop = history[0]?.crop || null
  const yearsWithoutRest = calculateYearsWithoutRest(history)
  const needsRest = needsFieldRest(yearsWithoutRest, lastCrop)

  // Выбор лучшей культуры
  const crops: CropType[] = ["Пшеница", "Кукуруза", "Подсолнечник", "Соя", "Рапс", "Ячмень", "Овес", "Горох"]

  const scoredCrops = crops.map((crop) => {
    let score = 0
    const reasons: string[] = []

    const rule = CROP_ROTATION_RULES[crop]

    // Проверка совместимости с предшественником
    if (lastCrop) {
      if (rule.goodPredecessors.includes(lastCrop)) {
        score += 30
        reasons.push(`Хороший предшественник: ${lastCrop}`)
      } else if (rule.badPredecessors.includes(lastCrop)) {
        score -= 40
        reasons.push(`Плохой предшественник: ${lastCrop}`)
      }
    } else {
      score += 10
      reasons.push("Поле свободно для любой культуры")
    }

    // Проверка соответствия почвы
    if (OPTIMAL_SOIL_FOR_CROP[crop].includes(field.soilType)) {
      score += 25
      reasons.push(`Оптимальная почва: ${field.soilType}`)
    } else {
      score -= 15
    }

    // Проверка периода возврата на поле
    const lastPlantingOfCrop = history.find((h) => h.crop === crop)
    if (lastPlantingOfCrop) {
      const yearsSinceLastPlanting = new Date().getFullYear() - lastPlantingOfCrop.year
      if (yearsSinceLastPlanting < rule.restPeriod) {
        score -= 50
        reasons.push(`Рано возвращать на поле (нужно ${rule.restPeriod} лет)`)
      } else {
        score += 15
        reasons.push("Достаточный перерыв после последнего посева")
      }
    }

    // Рентабельность
    const profitability = CROP_PROFITABILITY[crop]
    score += profitability * 0.5

    // Влияние на почву
    score += rule.soilRestoration * 0.2
    if (rule.soilRestoration > 80) {
      reasons.push("Восстанавливает плодородие почвы")
    }

    // Расчет ожидаемой урожайности
    const baseYield = BASE_YIELDS[crop]
    const soilCoeff = SOIL_COEFFICIENTS[field.soilType]
    const expectedYield = Number((baseYield * soilCoeff).toFixed(2))

    return {
      crop,
      score,
      reasons,
      expectedYield,
      profitability,
      riskLevel: score > 50 ? "Низкий" : score > 20 ? "Средний" : "Высокий",
    }
  })

  // Сортировка по баллам
  scoredCrops.sort((a, b) => b.score - a.score)

  const bestCrop = scoredCrops[0]!
  const alternatives = scoredCrops.slice(1, 4)

  // Определение уровня риска
  let riskLevel: "Низкий" | "Средний" | "Высокий" = "Низкий"
  if (needsRest) {
    riskLevel = "Высокий"
  } else if (bestCrop.score < 30) {
    riskLevel = "Средний"
  }

  // Формирование рекомендации по отдыху
  let restRecommendation = ""
  if (needsRest) {
    restRecommendation = `Рекомендуется дать полю отдохнуть 1-2 года. Поле активно использовалось ${yearsWithoutRest} лет подряд.`
  } else if (yearsWithoutRest >= 4) {
    restRecommendation = `Поле используется ${yearsWithoutRest} лет. Рассмотрите посев сидератов для восстановления почвы.`
  }

  return {
    fieldId: field.id,
    fieldName: field.name,
    previousCrop: lastCrop,
    soilType: field.soilType,
    yearsWithoutRest,
    needsRest,
    restRecommendation,
    recommendedCrop: bestCrop.crop,
    reason: bestCrop.reasons.join(". "),
    expectedYield: bestCrop.expectedYield,
    profitability: bestCrop.profitability,
    riskLevel,
    alternativeCrops: alternatives.map((a) => ({
      crop: a.crop,
      reason: a.reasons[0] || "Альтернативный вариант",
      expectedYield: a.expectedYield,
    })),
  }
}

// Генерация общих рекомендаций
export function generateGeneralRecommendations(
  fields: Field[],
  plantings: Planting[],
  harvests: Harvest[],
  fertilizations: Fertilization[],
): GeneralRecommendation[] {
  const recommendations: GeneralRecommendation[] = []

  // Защита от undefined параметров
  if (!fields) fields = []
  if (!plantings) plantings = []
  if (!harvests) harvests = []
  if (!fertilizations) fertilizations = []

  // Проверка диверсификации культур
  const currentCrops = new Set(plantings.map((p) => p.crop))
  if (currentCrops.size < 3) {
    recommendations.push({
      title: "Диверсификация культур",
      description:
        "Рекомендуется выращивать не менее 3-4 разных культур для снижения рисков и поддержания здоровья почвы.",
      priority: "medium",
      category: "rotation",
    })
  }

  // Проверка наличия бобовых
  const hasLegumes = currentCrops.has("Горох") || currentCrops.has("Соя")
  if (!hasLegumes && fields.length > 2) {
    recommendations.push({
      title: "Включите бобовые в севооборот",
      description:
        "Бобовые культуры (горох, соя) обогащают почву азотом и являются отличными предшественниками для зерновых.",
      priority: "high",
      category: "rotation",
    })
  }

  // Анализ урожайности
  const avgYields = harvests.map((h) => h.actualYield)
  if (avgYields.length > 0) {
    const avg = avgYields.reduce((a, b) => a + b, 0) / avgYields.length
    if (avg < 3) {
      recommendations.push({
        title: "Низкая урожайность",
        description:
          "Средняя урожайность ниже ожидаемой. Рекомендуется провести анализ почвы и оптимизировать программу внесения удобрений.",
        priority: "high",
        category: "fertilizer",
      })
    }
  }

  // Проверка полей на отдых
  const fieldsNeedingRest = fields.filter((f) => f.status === "Убрано")
  if (fieldsNeedingRest.length > 0) {
    recommendations.push({
      title: "Планирование отдыха полей",
      description: `${fieldsNeedingRest.length} полей готовы к следующему сезону. Рассмотрите возможность дать части полей отдохнуть или посеять сидераты.`,
      priority: "medium",
      category: "soil",
    })
  }

  // Проверка полей готовых к сбору
  const fieldsReadyForHarvest = fields.filter((f) => f.status === 'Готово к сбору')
  if (fieldsReadyForHarvest.length > 0) {
    recommendations.push({
      title: "Поля готовы к сбору урожая",
      description: `${fieldsReadyForHarvest.map(f => f.name).join(', ')} готовы к сбору урожая.`,
      priority: "high",
      category: "timing",
    })
  }

  // Проверка запланированных удобрений
  const today = new Date()
  const upcomingFertilizations = fertilizations.filter((f) => f.applicationDate > today)
  if (upcomingFertilizations.length > 0) {
    // Группировать по дате
    const grouped = upcomingFertilizations.reduce((acc, f) => {
      const dateKey = f.applicationDate.toDateString()
      if (!acc[dateKey]) acc[dateKey] = []
      acc[dateKey].push(f)
      return acc
    }, {} as Record<string, Fertilization[]>)

    for (const dateKey in grouped) {
      const ferts = grouped[dateKey]
      if (!ferts) continue
      const date = new Date(dateKey)
      const fieldNames = ferts.map((f: Fertilization) => {
        const planting = plantings.find(p => p.id === f.plantingId)
        const field = planting ? fields.find(fld => fld.id === planting.fieldId) : null
        return field ? field.name : 'неизвестное поле'
      }).join(', ')

      recommendations.push({
        title: `Внести удобрения ${date.toLocaleDateString('ru-RU')}`,
        description: `Поля: ${fieldNames}. Удобрения: ${ferts.map(f => f.fertilizerName).join(', ')}.`,
        priority: "medium",
        category: "fertilizer",
      })
    }
  }

  // Сезонная рекомендация
  const currentMonth = new Date().getMonth()
  if (currentMonth >= 2 && currentMonth <= 4) {
    recommendations.push({
      title: "Весенний сев",
      description: "Оптимальное время для посева яровых культур. Подготовьте семена и технику.",
      priority: "high",
      category: "timing",
    })
  } else if (currentMonth >= 7 && currentMonth <= 9) {
    recommendations.push({
      title: "Уборка урожая",
      description: "Период уборки урожая. Следите за погодными условиями и готовьте технику.",
      priority: "high",
      category: "timing",
    })
  } else if (currentMonth >= 8 && currentMonth <= 10) {
    recommendations.push({
      title: "Озимый сев",
      description: "Оптимальное время для посева озимых культур (пшеница, рапс, ячмень).",
      priority: "medium",
      category: "timing",
    })
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
}
