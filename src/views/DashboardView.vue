<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[#1c1917]">Панель управления</h1>
      <p class="text-[#78716c] mt-1">Обзор вашего сельскохозяйственного хозяйства</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-white rounded-xl border border-[#e7e5e4] p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[#78716c] text-sm">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-[#1c1917] mt-1">{{ stat.value }}</p>
            <p class="text-xs mt-2" :class="stat.changeType === 'positive' ? 'text-[#22c55e]' : 'text-[#78716c]'">
              {{ stat.change }}
            </p>
          </div>
          <div
            class="w-12 h-12 rounded-lg flex items-center justify-center"
            :class="stat.bgColor"
          >
            <component :is="stat.icon" class="w-6 h-6" :class="stat.iconColor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity & Fields Overview -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Fields Status -->
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Статус полей</h2>
        <div class="space-y-4">
          <div
            v-for="field in fieldsStore.fields"
            :key="field.id"
            class="flex items-center justify-between p-4 bg-[#f5f5f4] rounded-lg"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                <Map class="w-5 h-5 text-[#22c55e]" />
              </div>
              <div>
                <p class="font-medium text-[#1c1917]">{{ field.name }}</p>
                <p class="text-sm text-[#78716c]">{{ field.area }} га</p>
              </div>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(field.status)"
            >
              {{ field.status }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Быстрые действия</h2>
        <div class="grid grid-cols-2 gap-4">
          <RouterLink
            to="/farmers"
            class="flex flex-col items-center gap-2 p-4 bg-[#f5f5f4] rounded-lg hover:bg-[#22c55e]/10 transition-colors"
          >
            <Users class="w-8 h-8 text-[#22c55e]" />
            <span class="text-sm font-medium text-[#1c1917]">Добавить фермера</span>
          </RouterLink>
          <RouterLink
            to="/fields"
            class="flex flex-col items-center gap-2 p-4 bg-[#f5f5f4] rounded-lg hover:bg-[#22c55e]/10 transition-colors"
          >
            <MapPlus class="w-8 h-8 text-[#22c55e]" />
            <span class="text-sm font-medium text-[#1c1917]">Создать поле</span>
          </RouterLink>
          <RouterLink
            to="/analytics"
            class="flex flex-col items-center gap-2 p-4 bg-[#f5f5f4] rounded-lg hover:bg-[#22c55e]/10 transition-colors"
          >
            <BarChart3 class="w-8 h-8 text-[#22c55e]" />
            <span class="text-sm font-medium text-[#1c1917]">Аналитика</span>
          </RouterLink>
          <RouterLink
            to="/recommendations"
            class="flex flex-col items-center gap-2 p-4 bg-[#f5f5f4] rounded-lg hover:bg-[#22c55e]/10 transition-colors"
          >
            <Lightbulb class="w-8 h-8 text-[#22c55e]" />
            <span class="text-sm font-medium text-[#1c1917]">Рекомендации</span>
          </RouterLink>
        </div>

        <!-- Upcoming Tasks -->
        <div class="mt-6">
          <h3 class="text-md font-semibold text-[#1c1917] mb-3">Предстоящие задачи</h3>
          <div v-if="upcomingTasks.length > 0" class="space-y-3">
            <div
              v-for="task in upcomingTasks"
              :key="task.type + task.description"
              class="flex items-center gap-3 p-3 rounded-lg"
              :class="task.bgColor"
            >
              <component :is="task.icon" class="w-5 h-5" :class="task.iconColor" />
              <div>
                <p class="text-sm font-medium text-[#1c1917]">{{ task.title }}</p>
                <p class="text-xs text-[#78716c]">{{ task.description }}</p>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-[#78716c]">Нет предстоящих задач</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { Users, Map, Sprout, TrendingUp, MapPlus, BarChart3, Lightbulb, AlertCircle, CheckCircle } from 'lucide-vue-next'
import { useFarmersStore } from '@/stores/farmers'
import { useFieldsStore } from '@/stores/fields'
import { usePlantingsStore } from '@/stores/plantings'
import { useFertilizationsStore } from '@/stores/fertilizations'
import type { FieldStatus } from '@/types'

const farmersStore = useFarmersStore()
const fieldsStore = useFieldsStore()
const plantingsStore = usePlantingsStore()
const fertilizationsStore = useFertilizationsStore()

const stats = computed(() => [
  {
    label: 'Всего фермеров',
    value: farmersStore.farmers.length,
    change: '+2 за месяц',
    changeType: 'positive',
    icon: Users,
    bgColor: 'bg-[#22c55e]/10',
    iconColor: 'text-[#22c55e]'
  },
  {
    label: 'Полей',
    value: fieldsStore.fields.length,
    change: `${fieldsStore.totalArea} га общая площадь`,
    changeType: 'neutral',
    icon: Map,
    bgColor: 'bg-[#3b82f6]/10',
    iconColor: 'text-[#3b82f6]'
  },
  {
    label: 'Активных посевов',
    value: plantingsStore.plantings.filter(p => !p.harvested).length,
    change: 'В этом сезоне',
    changeType: 'neutral',
    icon: Sprout,
    bgColor: 'bg-[#22c55e]/10',
    iconColor: 'text-[#22c55e]'
  },
  {
    label: 'Урожайность',
    value: '4.5 т/га',
    change: '+12% к прошлому году',
    changeType: 'positive',
    icon: TrendingUp,
    bgColor: 'bg-[#f59e0b]/10',
    iconColor: 'text-[#f59e0b]'
  }
])

const upcomingTasks = computed(() => {
  const tasks: Array<{type: string, title: string, description: string, icon: any, bgColor: string, iconColor: string}> = []

  // Поля готовые к сбору
  const readyFields = fieldsStore.fields.filter(f => f.status === 'Готово к сбору')
  readyFields.forEach(field => {
    const planting = plantingsStore.getPlantingByFieldId(field.id)
    if (planting) {
      tasks.push({
        type: 'harvest',
        title: 'Готово к сбору урожая',
        description: `${field.name} - ${planting.crop}`,
        icon: CheckCircle,
        bgColor: 'bg-[#22c55e]/10',
        iconColor: 'text-[#22c55e]'
      })
    }
  })

  // Запланированные удобрения
  const today = new Date()
  const upcomingFertilizers = fertilizationsStore.fertilizations.filter(f => f.applicationDate > today)
  upcomingFertilizers.forEach(fert => {
    const planting = plantingsStore.plantings.find(p => p.id === fert.plantingId)
    const field = planting ? fieldsStore.fields.find(f => f.id === planting.fieldId) : null
    if (field) {
      const daysUntil = Math.ceil((fert.applicationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      tasks.push({
        type: 'fertilizer',
        title: 'Внесение удобрений',
        description: `${field.name} - ${fert.fertilizerName} (через ${daysUntil} дней)`,
        icon: AlertCircle,
        bgColor: 'bg-[#f59e0b]/10',
        iconColor: 'text-[#f59e0b]'
      })
    }
  })

  return tasks
})

const getStatusClass = (status: FieldStatus): string => {
  const classes: Record<FieldStatus, string> = {
    'Не засеяно': 'bg-[#78716c]/20 text-[#78716c]',
    'Засеяно': 'bg-[#3b82f6]/20 text-[#3b82f6]',
    'Готово к сбору': 'bg-[#22c55e]/20 text-[#22c55e]',
    'Убрано': 'bg-[#22c55e]/20 text-[#22c55e]',
    'Отдыхает': 'bg-[#f59e0b]/20 text-[#f59e0b]'
  }
  return classes[status]
}
</script>
