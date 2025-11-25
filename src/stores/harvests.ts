import { defineStore } from "pinia"
import { ref } from "vue"
import type { Harvest } from "@/types"

export const useHarvestsStore = defineStore("harvests", () => {
  const harvests = ref<Harvest[]>([])

  const addHarvest = (harvest: Omit<Harvest, "id">) => {
    const newHarvest: Harvest = {
      ...harvest,
      id: Date.now().toString(),
    }
    harvests.value.push(newHarvest)
    return newHarvest
  }

  const getHarvestByPlantingId = (plantingId: string) => {
    return harvests.value.find((h) => h.plantingId === plantingId)
  }

  const getHarvestHistory = () => {
    return harvests.value.sort((a, b) => b.harvestDate.getTime() - a.harvestDate.getTime())
  }

  return {
    harvests,
    addHarvest,
    getHarvestByPlantingId,
    getHarvestHistory,
  }
})
