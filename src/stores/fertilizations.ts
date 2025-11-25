import { defineStore } from "pinia"
import { ref } from "vue"
import type { Fertilization } from "@/types"

export const useFertilizationsStore = defineStore("fertilizations", () => {
  const fertilizations = ref<Fertilization[]>([
    {
      id: "1",
      plantingId: "1",
      fertilizerType: "Азотные",
      fertilizerName: "Аммиачная селитра",
      amount: 150,
      applicationDate: new Date("2024-05-20"),
      cost: 45000,
    },
    {
      id: "2",
      plantingId: "1",
      fertilizerType: "Фосфорные",
      fertilizerName: "Суперфосфат",
      amount: 100,
      applicationDate: new Date("2024-06-10"),
      cost: 30000,
    },
  ])

  const addFertilization = (fertilization: Omit<Fertilization, "id">) => {
    const newFertilization: Fertilization = {
      ...fertilization,
      id: Date.now().toString(),
    }
    fertilizations.value.push(newFertilization)
    return newFertilization
  }

  const getFertilizationsByPlantingId = (plantingId: string) => {
    return fertilizations.value.filter((f) => f.plantingId === plantingId)
  }

  return {
    fertilizations,
    addFertilization,
    getFertilizationsByPlantingId,
  }
})
