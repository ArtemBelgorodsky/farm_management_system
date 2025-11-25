import { defineStore } from "pinia"
import { ref } from "vue"
import type { Planting } from "@/types"

export const usePlantingsStore = defineStore("plantings", () => {
  const plantings = ref<Planting[]>([
    {
      id: "1",
      fieldId: "1",
      crop: "Пшеница",
      variety: "Московская 39",
      seedProducer: "АгроСемена",
      plantingArea: 150,
      seedAmount: 30000,
      plantingDate: new Date("2024-04-15"),
      expectedHarvestDate: new Date("2024-08-20"),
    },
    {
      id: "2",
      fieldId: "2",
      crop: "Кукуруза",
      variety: "Пионер 3921",
      seedProducer: "DuPont Pioneer",
      plantingArea: 200,
      seedAmount: 40000,
      plantingDate: new Date("2024-05-01"),
      expectedHarvestDate: new Date("2024-09-15"),
    },
  ])

  const addPlanting = (planting: Omit<Planting, "id">) => {
    const newPlanting: Planting = {
      ...planting,
      id: Date.now().toString(),
      harvested: false,
    }
    plantings.value.push(newPlanting)
    return newPlanting
  }

  const getPlantingByFieldId = (fieldId: string) => {
    return plantings.value
      .filter((p) => p.fieldId === fieldId && !p.harvested)
      .sort((a, b) => b.plantingDate.getTime() - a.plantingDate.getTime())[0] || null
  }

  const updatePlanting = (id: string, updates: Partial<Planting>) => {
    const index = plantings.value.findIndex((p) => p.id === id)
    if (index !== -1) {
      plantings.value[index] = { ...plantings.value[index], ...updates } as Planting
    }
  }

  return {
    plantings,
    addPlanting,
    getPlantingByFieldId,
    updatePlanting,
  }
})
