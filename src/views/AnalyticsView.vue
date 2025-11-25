<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[#1c1917]">Аналитика</h1>
      <p class="text-[#78716c] mt-1">Статистика и прогнозирование урожайности</p>
    </div>

    <!-- Overview Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-5">
        <div class="flex items-center gap-3 mb-2">
          <Map class="w-5 h-5 text-[#22c55e]" />
          <span class="text-sm text-[#78716c]">Всего полей</span>
        </div>
        <p class="text-2xl font-bold text-[#1c1917]">{{ stats.totalFields }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-5">
        <div class="flex items-center gap-3 mb-2">
          <Ruler class="w-5 h-5 text-[#3b82f6]" />
          <span class="text-sm text-[#78716c]">Общая площадь</span>
        </div>
        <p class="text-2xl font-bold text-[#1c1917]">{{ stats.totalArea }} га</p>
      </div>
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-5">
        <div class="flex items-center gap-3 mb-2">
          <Sprout class="w-5 h-5 text-[#22c55e]" />
          <span class="text-sm text-[#78716c]">Активных посевов</span>
        </div>
        <p class="text-2xl font-bold text-[#1c1917]">{{ stats.activePlantings }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-5">
        <div class="flex items-center gap-3 mb-2">
          <Wheat class="w-5 h-5 text-[#f59e0b]" />
          <span class="text-sm text-[#78716c]">Собрано урожаев</span>
        </div>
        <p class="text-2xl font-bold text-[#1c1917]">{{ stats.totalHarvests }}</p>
      </div>
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-5">
        <div class="flex items-center gap-3 mb-2">
          <Banknote class="w-5 h-5 text-[#ef4444]" />
          <span class="text-sm text-[#78716c]">Затраты на удобрения</span>
        </div>
        <p class="text-2xl font-bold text-[#1c1917]">{{ formatCurrency(stats.totalFertilizerCost) }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <!-- Yield Statistics -->
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Урожайность по культурам</h2>
        <div v-if="yieldStats.length > 0" class="space-y-4">
          <div
            v-for="stat in yieldStats"
            :key="stat.crop"
            class="p-4 bg-[#f5f5f4] rounded-lg"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="font-medium text-[#1c1917]">{{ stat.crop }}</span>
              <span class="text-sm font-semibold" :class="getEfficiencyColor(stat.efficiency)">
                {{ stat.efficiency }}% эффективности
              </span>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-[#78716c]">Ср. урожайность</span>
                <p class="font-medium text-[#1c1917]">{{ stat.avgYield }} т/га</p>
              </div>
              <div>
                <span class="text-[#78716c]">Площадь</span>
                <p class="font-medium text-[#1c1917]">{{ stat.totalArea }} га</p>
              </div>
              <div>
                <span class="text-[#78716c]">Всего урожая</span>
                <p class="font-medium text-[#1c1917]">{{ stat.totalHarvest }} т</p>
              </div>
            </div>
            <div class="mt-3">
              <div class="w-full h-2 bg-[#e7e5e4] rounded-full">
                <div
                  class="h-full rounded-full transition-all"
                  :class="getEfficiencyBarColor(stat.efficiency)"
                  :style="{ width: `${Math.min(stat.efficiency, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-[#78716c] text-center py-8">Нет данных об урожайности</p>
      </div>

      <!-- Fertilizer Efficiency -->
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Эффективность удобрений</h2>
        <div v-if="fertilizerStats.length > 0" class="space-y-4">
          <div
            v-for="stat in fertilizerStats"
            :key="stat.fertilizerType"
            class="p-4 bg-[#f5f5f4] rounded-lg"
          >
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <Beaker class="w-5 h-5 text-[#22c55e]" />
                <span class="font-medium text-[#1c1917]">{{ stat.fertilizerType }}</span>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span class="text-[#78716c]">Общие затраты</span>
                <p class="font-medium text-[#1c1917]">{{ formatCurrency(stat.totalCost) }}</p>
              </div>
              <div>
                <span class="text-[#78716c]">Ср. урожайность</span>
                <p class="font-medium text-[#1c1917]">{{ stat.avgYieldIncrease }} т/га</p>
              </div>
              <div>
                <span class="text-[#78716c]">Руб/тонна</span>
                <p class="font-medium text-[#1c1917]">{{ formatCurrency(stat.costPerTonYield) }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-[#78716c] text-center py-8">Нет данных об удобрениях</p>
      </div>
    </div>

    <!-- Yield Forecast -->
    <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
      <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Прогноз урожайности</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="crop in cropForecasts"
          :key="crop.name"
          class="p-4 bg-[#f5f5f4] rounded-lg"
        >
          <div class="flex items-center gap-2 mb-3">
            <Wheat class="w-5 h-5" :class="crop.color" />
            <span class="font-medium text-[#1c1917]">{{ crop.name }}</span>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-[#78716c]">Базовая урожайность</span>
              <span class="text-[#1c1917]">{{ crop.baseYield }} т/га</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#78716c]">Прогноз (чернозем)</span>
              <span class="text-[#22c55e] font-medium">{{ crop.blackSoilYield }} т/га</span>
            </div>
            <div class="flex justify-between">
              <span class="text-[#78716c]">Прогноз (суглинок)</span>
              <span class="text-[#3b82f6] font-medium">{{ crop.loamYield }} т/га</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Map, Ruler, Sprout, Wheat, Banknote, Beaker } from 'lucide-vue-next'
import { useAnalyticsStore } from '@/stores/analytics'
import { BASE_YIELDS, SOIL_COEFFICIENTS } from '@/utils/calculations'
import type { CropType } from '@/types'

const analyticsStore = useAnalyticsStore()

const stats = computed(() => analyticsStore.overallStats)
const yieldStats = computed(() => analyticsStore.yieldStatistics)
const fertilizerStats = computed(() => analyticsStore.fertilizerEfficiency)

const cropForecasts = computed(() => {
  const crops: CropType[] = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Соя', 'Рапс', 'Ячмень', 'Овес', 'Горох']
  const colors = ['text-[#f59e0b]', 'text-[#22c55e]', 'text-yellow-500', 'text-[#22c55e]', 'text-[#3b82f6]', 'text-orange-500', 'text-lime-500', 'text-emerald-500']
  
  return crops.map((crop, index) => ({
    name: crop,
    baseYield: BASE_YIELDS[crop],
    blackSoilYield: (BASE_YIELDS[crop] * SOIL_COEFFICIENTS['Чернозем']).toFixed(1),
    loamYield: (BASE_YIELDS[crop] * SOIL_COEFFICIENTS['Суглинок']).toFixed(1),
    color: colors[index]
  }))
})

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

const getEfficiencyColor = (efficiency: number): string => {
  if (efficiency >= 100) return 'text-[#22c55e]'
  if (efficiency >= 80) return 'text-[#3b82f6]'
  if (efficiency >= 60) return 'text-[#f59e0b]'
  return 'text-[#ef4444]'
}

const getEfficiencyBarColor = (efficiency: number): string => {
  if (efficiency >= 100) return 'bg-[#22c55e]'
  if (efficiency >= 80) return 'bg-[#3b82f6]'
  if (efficiency >= 60) return 'bg-[#f59e0b]'
  return 'bg-[#ef4444]'
}
</script>
