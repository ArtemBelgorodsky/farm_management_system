import { defineStore } from "pinia"
import { computed } from "vue"
import { useFieldsStore } from "./fields"
import { usePlantingsStore } from "./plantings"
import { useHarvestsStore } from "./harvests"
import { useFertilizationsStore } from "./fertilizations"
import type { CropType } from "../types"
import { calculateExpectedYield, BASE_YIELDS } from "../utils/calculations"

export interface YieldStatistics {
  crop: CropType
  avgYield: number
  totalArea: number
  totalHarvest: number
  efficiency: number // процент от базовой урожайности
}

export interface FertilizerEfficiency {
  fertilizerType: string
  totalCost: number
  avgYieldIncrease: number
  costPerTonYield: number
}

export interface MonthlyData {
  month: string
  plantings: number
  harvests: number
  fertilizations: number
}

export const useAnalyticsStore = defineStore("analytics", () => {
  const fieldsStore = useFieldsStore()
  const plantingsStore = usePlantingsStore()
  const harvestsStore = useHarvestsStore()
  const fertilizationsStore = useFertilizationsStore()

  // Статистика урожайности по культурам
  const yieldStatistics = computed((): YieldStatistics[] => {
    const stats: Map<CropType, { yields: number[]; areas: number[] }> = new Map()

    for (const planting of plantingsStore.plantings) {
      const harvest = harvestsStore.getHarvestByPlantingId(planting.id)
      if (!harvest) continue

      if (!stats.has(planting.crop)) {
        stats.set(planting.crop, { yields: [], areas: [] })
      }

      const stat = stats.get(planting.crop)!
      stat.yields.push(harvest.actualYield)
      stat.areas.push(planting.plantingArea)
    }

    // Добавляем данные о текущих посевах без урожая
    for (const planting of plantingsStore.plantings) {
      if (!harvestsStore.getHarvestByPlantingId(planting.id)) {
        const field = fieldsStore.getFieldById(planting.fieldId)
        if (!field) continue

        const fertilizations = fertilizationsStore.getFertilizationsByPlantingId(planting.id)
        const expectedYield = calculateExpectedYield(
          planting.crop,
          field.soilType,
          planting.seedAmount,
          planting.plantingArea,
          fertilizations,
        )

        if (!stats.has(planting.crop)) {
          stats.set(planting.crop, { yields: [], areas: [] })
        }

        const stat = stats.get(planting.crop)!
        stat.yields.push(expectedYield)
        stat.areas.push(planting.plantingArea)
      }
    }

    const result: YieldStatistics[] = []

    for (const [crop, data] of stats) {
      const avgYield = data.yields.reduce((a, b) => a + b, 0) / data.yields.length
      const totalArea = data.areas.reduce((a, b) => a + b, 0)
      const totalHarvest = avgYield * totalArea
      const efficiency = (avgYield / BASE_YIELDS[crop]) * 100

      result.push({
        crop,
        avgYield: Number(avgYield.toFixed(2)),
        totalArea,
        totalHarvest: Number(totalHarvest.toFixed(1)),
        efficiency: Number(efficiency.toFixed(1)),
      })
    }

    return result.sort((a, b) => b.efficiency - a.efficiency)
  })

  // Эффективность удобрений
  const fertilizerEfficiency = computed((): FertilizerEfficiency[] => {
    const stats: Map<string, { costs: number[]; yields: number[] }> = new Map()

    for (const fert of fertilizationsStore.fertilizations) {
      const planting = plantingsStore.plantings.find((p) => p.id === fert.plantingId)
      if (!planting) continue

      const field = fieldsStore.getFieldById(planting.fieldId)
      if (!field) continue

      const harvest = harvestsStore.getHarvestByPlantingId(planting.id)
      const actualYield =
        harvest?.actualYield ||
        calculateExpectedYield(planting.crop, field.soilType, planting.seedAmount, planting.plantingArea, [fert])

      if (!stats.has(fert.fertilizerType)) {
        stats.set(fert.fertilizerType, { costs: [], yields: [] })
      }

      const stat = stats.get(fert.fertilizerType)!
      stat.costs.push(fert.cost)
      stat.yields.push(actualYield)
    }

    const result: FertilizerEfficiency[] = []

    for (const [type, data] of stats) {
      const totalCost = data.costs.reduce((a, b) => a + b, 0)
      const avgYieldIncrease = data.yields.reduce((a, b) => a + b, 0) / data.yields.length
      const costPerTonYield = totalCost / (avgYieldIncrease * data.yields.length)

      result.push({
        fertilizerType: type,
        totalCost,
        avgYieldIncrease: Number(avgYieldIncrease.toFixed(2)),
        costPerTonYield: Number(costPerTonYield.toFixed(0)),
      })
    }

    return result
  })

  // Общая статистика
  const overallStats = computed(() => {
    const totalFields = fieldsStore.fields.length
    const totalArea = fieldsStore.totalArea
    const activePlantings = plantingsStore.plantings.length
    const totalHarvests = harvestsStore.harvests.length
    const totalFertilizerCost = fertilizationsStore.fertilizations.reduce((sum, f) => sum + f.cost, 0)

    return {
      totalFields,
      totalArea,
      activePlantings,
      totalHarvests,
      totalFertilizerCost,
    }
  })

  // Данные для графика по месяцам
  const monthlyData = computed((): MonthlyData[] => {
    const months = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"]

    return months.map((month, index) => {
      const plantingsCount = plantingsStore.plantings.filter((p) => p.plantingDate.getMonth() === index).length

      const harvestsCount = harvestsStore.harvests.filter((h) => h.harvestDate.getMonth() === index).length

      const fertilizationsCount = fertilizationsStore.fertilizations.filter(
        (f) => f.applicationDate.getMonth() === index,
      ).length

      return {
        month,
        plantings: plantingsCount,
        harvests: harvestsCount,
        fertilizations: fertilizationsCount,
      }
    })
  })

  return {
    yieldStatistics,
    fertilizerEfficiency,
    overallStats,
    monthlyData,
  }
})
