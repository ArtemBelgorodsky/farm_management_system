<template>
  <div>
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-[#1c1917]">Рекомендации фермеру</h1>
      <p class="text-[#78716c] mt-1">Подсистема рекомендаций для оптимального севооборота</p>
    </div>

    <!-- Общие рекомендации -->
    <div class="bg-white rounded-xl border border-[#e7e5e4] p-6 mb-8">
      <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Общие рекомендации</h2>
      <div v-if="generalRecommendations.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="(rec, index) in generalRecommendations"
          :key="index"
          class="p-4 rounded-lg border"
          :class="getPriorityClass(rec.priority)"
        >
          <div class="flex items-start gap-3">
            <span v-html="getCategoryIcon(rec.category)" :class="getPriorityIconColor(rec.priority)"></span>
            <div>
              <div class="flex items-center gap-2 mb-1 flex-wrap">
                <h3 class="font-medium text-[#1c1917]">{{ rec.title }}</h3>
                <span
                  class="px-2 py-0.5 rounded text-xs font-medium"
                  :class="getPriorityBadgeClass(rec.priority)"
                >
                  {{ getPriorityLabel(rec.priority) }}
                </span>
              </div>
              <p class="text-sm text-[#57534e]">{{ rec.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-[#78716c] text-center py-4">Нет общих рекомендаций</p>
    </div>

    <!-- База знаний: Севооборот -->
    <div class="bg-white rounded-xl border border-[#e7e5e4] p-6 mb-8">
      <h2 class="text-lg font-semibold text-[#1c1917] mb-4">База знаний: Севооборот</h2>
      <p class="text-sm text-[#78716c] mb-4">Таблица совместимости культур с предшественниками</p>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[#f5f5f4]">
            <tr>
              <th class="px-4 py-3 text-left font-semibold text-[#1c1917]">Культура</th>
              <th class="px-4 py-3 text-left font-semibold text-[#1c1917]">Хорошие предшественники</th>
              <th class="px-4 py-3 text-left font-semibold text-[#1c1917]">Плохие предшественники</th>
              <th class="px-4 py-3 text-center font-semibold text-[#1c1917]">Период возврата (лет)</th>
              <th class="px-4 py-3 text-center font-semibold text-[#1c1917]">Восстановление почвы</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(rule, crop) in cropRotationRules" :key="crop" class="border-b border-[#e7e5e4]">
              <td class="px-4 py-3 font-medium text-[#1c1917]">{{ crop }}</td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="pred in rule.goodPredecessors" 
                    :key="pred"
                    class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs"
                  >
                    {{ pred }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="flex flex-wrap gap-1">
                  <span 
                    v-for="pred in rule.badPredecessors" 
                    :key="pred"
                    class="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs"
                  >
                    {{ pred }}
                  </span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">{{ rule.restPeriod }}</td>
              <td class="px-4 py-3">
                <div class="flex items-center justify-center gap-2">
                  <div class="w-16 h-2 bg-[#e7e5e4] rounded-full overflow-hidden">
                    <div 
                      class="h-full rounded-full"
                      :class="rule.soilRestoration > 70 ? 'bg-green-500' : rule.soilRestoration > 50 ? 'bg-yellow-500' : 'bg-red-500'"
                      :style="{ width: rule.soilRestoration + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs text-[#78716c]">{{ rule.soilRestoration }}%</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Рекомендации по полям -->
    <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
      <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Рекомендации по полям на следующий сезон</h2>
      
      <div v-if="fieldRecommendations.length === 0" class="text-center py-8 text-[#78716c]">
        <svg class="w-12 h-12 mx-auto mb-3 text-[#d6d3d1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Нет полей для анализа. Добавьте поля и посевы для получения рекомендаций.</p>
      </div>

      <div v-else class="space-y-6">
        <div 
          v-for="rec in fieldRecommendations" 
          :key="rec.fieldId"
          class="border border-[#e7e5e4] rounded-lg overflow-hidden"
        >
          <!-- Заголовок поля -->
          <div class="bg-[#f5f5f4] px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-[#22c55e] flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <div>
                <h3 class="font-semibold text-[#1c1917]">{{ rec.fieldName }}</h3>
                <p class="text-sm text-[#78716c]">Почва: {{ rec.soilType }}</p>
              </div>
            </div>
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="{
                'bg-green-100 text-green-700': rec.riskLevel === 'Низкий',
                'bg-yellow-100 text-yellow-700': rec.riskLevel === 'Средний',
                'bg-red-100 text-red-700': rec.riskLevel === 'Высокий'
              }"
            >
              Риск: {{ rec.riskLevel }}
            </span>
          </div>

          <!-- Содержимое -->
          <div class="p-4">
            <!-- Предупреждение об отдыхе -->
            <div v-if="rec.needsRest" class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="font-medium text-amber-800">Требуется отдых поля</p>
                  <p class="text-sm text-amber-700">{{ rec.restRecommendation }}</p>
                </div>
              </div>
            </div>

            <!-- Информация о предыдущей культуре -->
            <div class="mb-4 flex items-center gap-4 text-sm flex-wrap">
              <div>
                <span class="text-[#78716c]">Предыдущая культура:</span>
                <span class="ml-2 font-medium text-[#1c1917]">{{ rec.previousCrop || 'Не засеивалось' }}</span>
              </div>
              <div>
                <span class="text-[#78716c]">Лет использования:</span>
                <span class="ml-2 font-medium text-[#1c1917]">{{ rec.yearsWithoutRest }}</span>
              </div>
            </div>

            <!-- Рекомендуемая культура -->
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 class="font-semibold text-green-800">Рекомендуемая культура</h4>
                <span class="text-2xl font-bold text-green-700">{{ rec.recommendedCrop }}</span>
              </div>
              <p class="text-sm text-green-700 mb-3">{{ rec.reason }}</p>
              <div class="flex gap-4 text-sm flex-wrap">
                <div>
                  <span class="text-green-600">Ожидаемая урожайность:</span>
                  <span class="ml-1 font-semibold text-green-800">{{ rec.expectedYield }} т/га</span>
                </div>
                <div>
                  <span class="text-green-600">Рентабельность:</span>
                  <span class="ml-1 font-semibold text-green-800">{{ rec.profitability }}%</span>
                </div>
              </div>
            </div>

            <!-- Альтернативные культуры -->
            <div>
              <h4 class="font-medium text-[#1c1917] mb-2">Альтернативные варианты:</h4>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div 
                  v-for="alt in rec.alternativeCrops" 
                  :key="alt.crop"
                  class="p-3 bg-[#f5f5f4] rounded-lg"
                >
                  <div class="font-medium text-[#1c1917]">{{ alt.crop }}</div>
                  <div class="text-xs text-[#78716c] mt-1">{{ alt.reason }}</div>
                  <div class="text-sm text-[#57534e] mt-1">{{ alt.expectedYield }} т/га</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useFieldsStore } from '@/stores/fields'
import { usePlantingsStore } from '@/stores/plantings'
import { useFertilizationsStore } from '@/stores/fertilizations'
import { useHarvestsStore } from '@/stores/harvests'
import { 
  CROP_ROTATION_RULES, 
  generateFieldRecommendation, 
  generateGeneralRecommendations
} from '@/utils/recommendations'

export default defineComponent({
  name: 'RecommendationsView',
  setup() {
    const fieldsStore = useFieldsStore()
    const plantingsStore = usePlantingsStore()
    const fertilizationsStore = useFertilizationsStore()
    const harvestsStore = useHarvestsStore()

    const cropRotationRules = CROP_ROTATION_RULES

    const generalRecommendations = computed(() => {
      return generateGeneralRecommendations(
        fieldsStore.fields,
        plantingsStore.plantings,
        harvestsStore.harvests,
        fertilizationsStore.fertilizations
      )
    })

    const fieldRecommendations = computed(() => {
      return fieldsStore.fields.map(field =>
        generateFieldRecommendation(field, plantingsStore.plantings, harvestsStore.harvests)
      )
    })

    function getPriorityClass(priority: string): string {
      switch (priority) {
        case 'high': return 'bg-red-50 border-red-200'
        case 'medium': return 'bg-amber-50 border-amber-200'
        case 'low': return 'bg-blue-50 border-blue-200'
        default: return 'bg-gray-50 border-gray-200'
      }
    }

    function getPriorityIconColor(priority: string): string {
      switch (priority) {
        case 'high': return 'text-red-600'
        case 'medium': return 'text-amber-600'
        case 'low': return 'text-blue-600'
        default: return 'text-gray-600'
      }
    }

    function getPriorityBadgeClass(priority: string): string {
      switch (priority) {
        case 'high': return 'bg-red-100 text-red-700'
        case 'medium': return 'bg-amber-100 text-amber-700'
        case 'low': return 'bg-blue-100 text-blue-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }

    function getPriorityLabel(priority: string): string {
      switch (priority) {
        case 'high': return 'Важно'
        case 'medium': return 'Рекомендация'
        case 'low': return 'Совет'
        default: return priority
      }
    }

    function getCategoryIcon(category: string): string {
      const icons: Record<string, string> = {
        rotation: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
        fertilizer: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>',
        soil: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" /></svg>',
        timing: '<svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
      }
      return icons[category] || icons.rotation
    }

    return {
      cropRotationRules,
      generalRecommendations,
      fieldRecommendations,
      getPriorityClass,
      getPriorityIconColor,
      getPriorityBadgeClass,
      getPriorityLabel,
      getCategoryIcon
    }
  }
})
</script>
