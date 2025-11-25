import { defineStore } from "pinia"
import { ref } from "vue"
import type { Farmer } from "@/types"

export const useFarmersStore = defineStore("farmers", () => {
  const farmers = ref<Farmer[]>([
    {
      id: "1",
      name: "Иванов Петр Сергеевич",
      email: "ivanov@example.com",
      phone: "+7 (900) 123-45-67",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Сидоров Алексей Иванович",
      email: "sidorov@example.com",
      phone: "+7 (901) 234-56-78",
      createdAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      name: "Петрова Мария Дмитриевна",
      email: "petrova@example.com",
      phone: "+7 (902) 345-67-89",
      createdAt: new Date("2024-03-10"),
    },
  ])

  const addFarmer = (farmer: Omit<Farmer, "id" | "createdAt">) => {
    const newFarmer: Farmer = {
      ...farmer,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    farmers.value.push(newFarmer)
    return newFarmer
  }

  const getFarmerById = (id: string) => {
    return farmers.value.find((f) => f.id === id)
  }

  const updateFarmer = (id: string, updates: Partial<Farmer>) => {
    const index = farmers.value.findIndex((f) => f.id === id)
    if (index !== -1) {
      const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))
      farmers.value[index] = { ...farmers.value[index], ...filteredUpdates } as Farmer
    }
  }

  const deleteFarmer = (id: string) => {
    const index = farmers.value.findIndex((f) => f.id === id)
    if (index !== -1) {
      farmers.value.splice(index, 1)
    }
  }

  return {
    farmers,
    addFarmer,
    getFarmerById,
    updateFarmer,
    deleteFarmer,
  }
})
