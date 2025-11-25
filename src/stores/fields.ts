import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Field } from "@/types"

export const useFieldsStore = defineStore("fields", () => {
  const fields = ref<Field[]>([
    {
      id: "1",
      farmerId: "1",
      name: "Южное поле",
      area: 150,
      soilType: "Чернозем",
      relief: "Равнинный",
      status: "Засеяно",
      createdAt: new Date("2024-03-01"),
    },
    {
      id: "2",
      farmerId: "1",
      name: "Западное поле",
      area: 200,
      soilType: "Суглинок",
      relief: "Холмистый",
      status: "Готово к сбору",
      createdAt: new Date("2024-03-15"),
    },
    {
      id: "3",
      farmerId: "2",
      name: "Восточное поле",
      area: 120,
      soilType: "Чернозем",
      relief: "Равнинный",
      status: "Не засеяно",
      createdAt: new Date("2024-04-01"),
    },
  ])

  const addField = (field: Omit<Field, "id" | "createdAt">) => {
    const newField: Field = {
      ...field,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    fields.value.push(newField)
    return newField
  }

  const getFieldById = (id: string) => {
    return fields.value.find((f) => f.id === id)
  }

  const getFieldsByFarmerId = (farmerId: string) => {
    return fields.value.filter((f) => f.farmerId === farmerId)
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    const index = fields.value.findIndex((f) => f.id === id)
    if (index !== -1) {
      const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined))
      fields.value[index] = { ...fields.value[index], ...filteredUpdates } as Field
    }
  }

  const deleteField = (id: string) => {
    const index = fields.value.findIndex((f) => f.id === id)
    if (index !== -1) {
      fields.value.splice(index, 1)
    }
  }

  const totalArea = computed(() => {
    return fields.value.reduce((sum, field) => sum + field.area, 0)
  })

  return {
    fields,
    addField,
    getFieldById,
    getFieldsByFarmerId,
    updateField,
    deleteField,
    totalArea,
  }
})
