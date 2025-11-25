<template>
  <div v-if="field">
    <div class="flex items-center gap-4 mb-8">
      <RouterLink
        to="/fields"
        class="p-2 hover:bg-[#f5f5f4] rounded-lg transition-colors"
      >
        <ArrowLeft class="w-5 h-5 text-[#57534e]" />
      </RouterLink>
      <div>
        <h1 class="text-2xl font-bold text-[#1c1917]">{{ field.name }}</h1>
        <p class="text-[#78716c] mt-1">{{ field.area }} га / {{ field.soilType }} / {{ field.relief }}</p>
      </div>
      <span
        class="ml-auto px-4 py-2 rounded-full text-sm font-medium"
        :class="getStatusClass(field.status)"
      >
        {{ field.status === 'Отдыхает' && field.nextPlantingDate ? `Отдыхает до ${formatDate(field.nextPlantingDate)}` : field.status }}
      </span>
    </div>

    <!-- Analytics Cards -->
    <div v-if="planting" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
            <TrendingUp class="w-5 h-5 text-[#22c55e]" />
          </div>
          <span class="text-[#78716c]">Ожидаемый урожай</span>
        </div>
        <p class="text-3xl font-bold text-[#1c1917]">{{ expectedYield }} т/га</p>
        <p class="text-sm text-[#78716c] mt-1">≈ {{ (expectedYield * field.area).toFixed(1) }} тонн всего</p>
      </div>

      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-[#3b82f6]/10 flex items-center justify-center">
            <Calendar class="w-5 h-5 text-[#3b82f6]" />
          </div>
          <span class="text-[#78716c]">Дата сбора</span>
        </div>
        <p class="text-3xl font-bold text-[#1c1917]">{{ formatDate(planting.expectedHarvestDate) }}</p>
        <p class="text-sm" :class="daysUntilHarvest > 0 ? 'text-[#3b82f6]' : 'text-[#22c55e]'">
          {{ daysUntilHarvest > 0 ? `Через ${daysUntilHarvest} дней` : 'Готово к сбору!' }}
        </p>
      </div>

      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
            <Heart class="w-5 h-5 text-[#22c55e]" />
          </div>
          <span class="text-[#78716c]">Здоровье посева</span>
        </div>
        <p class="text-3xl font-bold text-[#1c1917]">{{ healthScore }}%</p>
        <div class="w-full h-2 bg-[#f5f5f4] rounded-full mt-2">
          <div
            class="h-full rounded-full transition-all"
            :class="healthScore > 70 ? 'bg-[#22c55e]' : healthScore > 40 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'"
            :style="{ width: `${healthScore}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Current Planting Info -->
    <div v-if="planting" class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Информация о посеве</h2>
        <div class="space-y-4">
          <div class="flex justify-between items-center py-2 border-b border-[#e7e5e4]">
            <span class="text-[#78716c]">Культура</span>
            <span class="font-medium text-[#1c1917]">{{ planting.crop }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-[#e7e5e4]">
            <span class="text-[#78716c]">Сорт</span>
            <span class="font-medium text-[#1c1917]">{{ planting.variety }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-[#e7e5e4]">
            <span class="text-[#78716c]">Производитель семян</span>
            <span class="font-medium text-[#1c1917]">{{ planting.seedProducer }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-[#e7e5e4]">
            <span class="text-[#78716c]">Площадь посева</span>
            <span class="font-medium text-[#1c1917]">{{ planting.plantingArea }} га</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-[#e7e5e4]">
            <span class="text-[#78716c]">Количество семян</span>
            <span class="font-medium text-[#1c1917]">{{ planting.seedAmount }} кг</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-[#78716c]">Дата посева</span>
            <span class="font-medium text-[#1c1917]">{{ formatDate(planting.plantingDate) }}</span>
          </div>
        </div>
      </div>

      <!-- Fertilizer Recommendations -->
      <div class="bg-white rounded-xl border border-[#e7e5e4] p-6">
        <h2 class="text-lg font-semibold text-[#1c1917] mb-4">Рекомендации по удобрениям</h2>
        <div v-if="fertilizerRecommendations.length > 0" class="space-y-3">
          <div
            v-for="(rec, index) in fertilizerRecommendations"
            :key="index"
            class="p-4 bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <Beaker class="w-5 h-5 text-[#f59e0b] mt-0.5" />
              <div>
                <p class="font-medium text-[#1c1917]">{{ rec.name }} ({{ rec.type }})</p>
                <p class="text-sm text-[#78716c]">{{ rec.amount }} кг/га</p>
                <p class="text-sm text-[#78716c]">Дата: {{ formatDate(rec.applicationDate) }}</p>
                <p class="text-sm text-[#22c55e] mt-1">{{ rec.expectedEffect }}</p>
              </div>
            </div>
          </div>
        </div>
        <p v-else class="text-[#78716c]">Все рекомендованные удобрения внесены</p>
      </div>
    </div>

    <!-- Applied Fertilizers -->
    <div v-if="planting" class="bg-white rounded-xl border border-[#e7e5e4] p-6 mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-[#1c1917]">Внесенные удобрения</h2>
        <button
          @click="showAddFertilizerModal = true"
          class="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
        >
          <Plus class="w-4 h-4" />
          Добавить
        </button>
      </div>
      <div v-if="appliedFertilizers.length > 0" class="space-y-3">
        <div
          v-for="fert in appliedFertilizers"
          :key="fert.id"
          class="flex items-center justify-between p-4 bg-[#f5f5f4] rounded-lg"
        >
          <div class="flex items-center gap-3">
            <Beaker class="w-5 h-5 text-[#22c55e]" />
            <div>
              <p class="font-medium text-[#1c1917]">{{ fert.fertilizerName }} <span v-if="fert.applicationDate > new Date()" class="text-xs text-blue-600 font-medium">(запланировано)</span></p>
              <p class="text-sm text-[#78716c]">{{ fert.fertilizerType }} / {{ fert.amount }} кг/га</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-[#78716c]">{{ formatDate(fert.applicationDate) }}</p>
            <p class="text-sm font-medium text-[#1c1917]">{{ fert.cost.toLocaleString() }} ₽</p>
          </div>
        </div>
      </div>
      <p v-else class="text-[#78716c]">Удобрения еще не вносились</p>
    </div>

    <!-- Actions -->
    <div class="flex gap-4">
      <button
        v-if="field.status === 'Не засеяно'"
        @click="showPlantingModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
      >
        <Sprout class="w-5 h-5" />
        Засеять поле
      </button>
      
      <button
        v-if="field.status === 'Засеяно' || field.status === 'Готово к сбору'"
        @click="showHarvestModal = true"
        class="flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-white rounded-lg hover:bg-[#22c55e]/90 transition-colors"
      >
        <Wheat class="w-5 h-5" />
        Собрать урожай
      </button>
      
      <button
        v-if="field.status === 'Убрано'"
        @click="setFieldResting"
        class="flex items-center gap-2 px-6 py-3 bg-[#f59e0b] text-white rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
      >
        <Bed class="w-5 h-5" />
        Дать полю отдохнуть
      </button>
      
      <button
        v-if="field.status === 'Отдыхает'"
        @click="prepareForPlanting"
        class="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg hover:bg-[#3b82f6]/90 transition-colors"
      >
        <RotateCcw class="w-5 h-5" />
        Подготовить к посеву
      </button>
    </div>

    <!-- No Planting Info -->
    <div v-if="!planting && field.status === 'Не засеяно'" class="bg-white rounded-xl border border-[#e7e5e4] p-8 text-center mt-8">
      <Sprout class="w-16 h-16 text-[#78716c] mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-[#1c1917] mb-2">Поле не засеяно</h3>
      <p class="text-[#78716c] mb-4">Нажмите кнопку "Засеять поле" чтобы начать посев</p>
    </div>

    <!-- Planting Modal -->
    <div
      v-if="showPlantingModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showPlantingModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Засеять поле</h2>
        <div v-if="recommendedCrop" class="bg-[#22c55e]/5 border border-[#22c55e]/20 rounded-lg p-4 mb-4">
          <p class="text-sm text-[#22c55e] font-medium">Рекомендуемая культура: {{ recommendedCrop }}</p>
        </div>
        <form @submit.prevent="submitPlanting">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Культура</label>
              <select
                v-model="plantingForm.crop"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="">Выберите культуру</option>
                <option v-for="crop in cropTypes" :key="crop" :value="crop">{{ crop }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Сорт</label>
              <input
                v-model="plantingForm.variety"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="Московская 39"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Производитель семян</label>
              <input
                v-model="plantingForm.seedProducer"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="АгроСемена"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Площадь посева (га)</label>
              <input
                v-model.number="plantingForm.plantingArea"
                type="number"
                required
                :max="field.area"
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
              <p class="text-xs text-[#78716c] mt-1">Максимум: {{ field.area }} га</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Количество семян (кг)</label>
              <input
                v-model.number="plantingForm.seedAmount"
                type="number"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
              <p v-if="plantingForm.crop && seedingRateInfo" class="text-xs text-[#78716c] mt-1">
                Рекомендуемая норма: {{ seedingRateInfo.optimal }} кг/га
                ({{ seedingRateInfo.min }}-{{ seedingRateInfo.max }} кг/га)
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Дата посева</label>
              <input
                v-model="plantingForm.plantingDate"
                type="date"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showPlantingModal = false"
              class="px-4 py-2 text-[#57534e] hover:bg-[#f5f5f4] rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Засеять
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Harvest Modal -->
    <div
      v-if="showHarvestModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showHarvestModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Сбор урожая</h2>
        <form @submit.prevent="submitHarvest">
          <div class="space-y-4">
            <div class="p-4 bg-[#f5f5f4] rounded-lg">
              <p class="text-sm text-[#78716c]">Ожидаемый урожай</p>
              <p class="text-2xl font-bold text-[#1c1917]">{{ expectedYield }} т/га</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Фактический урожай (т/га)</label>
              <input
                v-model.number="harvestForm.actualYield"
                type="number"
                step="0.1"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Качество урожая</label>
              <select
                v-model="harvestForm.quality"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="Отличное">Отличное</option>
                <option value="Хорошее">Хорошее</option>
                <option value="Среднее">Среднее</option>
                <option value="Низкое">Низкое</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showHarvestModal = false"
              class="px-4 py-2 text-[#57534e] hover:bg-[#f5f5f4] rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#22c55e]/90 transition-colors"
            >
              Собрать урожай
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Fertilizer Modal -->
    <div
      v-if="showAddFertilizerModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddFertilizerModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Добавить удобрение</h2>
        <form @submit.prevent="submitFertilizer">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Тип удобрения</label>
              <select
                v-model="fertilizerForm.fertilizerType"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="">Выберите тип</option>
                <option v-for="type in fertilizerTypes" :key="type" :value="type">{{ type }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Название</label>
              <input
                v-model="fertilizerForm.fertilizerName"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="Аммиачная селитра"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Количество (кг/га)</label>
              <input
                v-model.number="fertilizerForm.amount"
                type="number"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Дата внесения</label>
              <input
                v-model="fertilizerForm.applicationDate"
                type="date"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Стоимость (₽)</label>
              <input
                v-model.number="fertilizerForm.cost"
                type="number"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
              />
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showAddFertilizerModal = false"
              class="px-4 py-2 text-[#57534e] hover:bg-[#f5f5f4] rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Rest Modal -->
    <div
      v-if="showRestModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showRestModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Дать полю отдохнуть</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-[#1c1917] mb-2">Рекомендуемая дата следующего засева</label>
            <input
              v-model="restDate"
              type="date"
              :min="recommendedRestDate"
              class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
            />
            <p class="text-xs text-[#78716c] mt-1">Рекомендуется: {{ formatDate(new Date(recommendedRestDate)) }}</p>
          </div>
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button
            type="button"
            @click="showRestModal = false"
            class="px-4 py-2 text-[#57534e] hover:bg-[#f5f5f4] rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            @click="confirmRest"
            class="px-4 py-2 bg-[#f59e0b] text-white rounded-lg hover:bg-[#f59e0b]/90 transition-colors"
          >
            Подтвердить отдых
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="text-center py-12">
    <p class="text-[#78716c]">Поле не найдено</p>
    <RouterLink to="/fields" class="text-[#22c55e] hover:underline mt-2 inline-block">
      Вернуться к списку полей
    </RouterLink>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { 
  ArrowLeft, TrendingUp, Calendar, Heart, Sprout, Wheat, Beaker, Plus, 
  Bed, RotateCcw 
} from 'lucide-vue-next'
import { useFieldsStore } from '@/stores/fields'
import { usePlantingsStore } from '@/stores/plantings'
import { useHarvestsStore } from '@/stores/harvests'
import { useFertilizationsStore } from '@/stores/fertilizations'
import type { FieldStatus, CropType, FertilizerType } from '@/types'
import {
  calculateExpectedYield,
  generateFertilizerRecommendations,
  calculateHealthScore,
  getDaysUntilHarvest,
  calculateHarvestDate,
  SEEDING_RATES
} from '@/utils/calculations'
import { CROP_ROTATION_RULES, getFieldHistory, generateFieldRecommendation } from '@/utils/recommendations'

const route = useRoute()
const fieldsStore = useFieldsStore()
const plantingsStore = usePlantingsStore()
const harvestsStore = useHarvestsStore()
const fertilizationsStore = useFertilizationsStore()

const fieldId = computed(() => route.params.id as string)
const field = computed(() => fieldsStore.getFieldById(fieldId.value))
const planting = computed(() => plantingsStore.getPlantingByFieldId(fieldId.value))
const appliedFertilizers = computed(() => 
  planting.value ? fertilizationsStore.getFertilizationsByPlantingId(planting.value.id) : []
)

const showPlantingModal = ref(false)
const showHarvestModal = ref(false)
const showAddFertilizerModal = ref(false)
const showRestModal = ref(false)

const cropTypes: CropType[] = ['Пшеница', 'Кукуруза', 'Подсолнечник', 'Соя', 'Рапс', 'Ячмень', 'Овес', 'Горох']
const fertilizerTypes: FertilizerType[] = ['Азотные', 'Фосфорные', 'Калийные', 'Органические', 'Комплексные']

const plantingForm = reactive({
  crop: '' as CropType,
  variety: '',
  seedProducer: '',
  plantingArea: 0,
  seedAmount: 0,
  plantingDate: new Date().toISOString().split('T')[0]
})

const harvestForm = reactive({
  actualYield: 0,
  quality: 'Хорошее' as 'Отличное' | 'Хорошее' | 'Среднее' | 'Низкое'
})

const fertilizerForm = reactive({
  fertilizerType: '' as FertilizerType,
  fertilizerName: '',
  amount: 0,
  applicationDate: new Date().toISOString().split('T')[0],
  cost: 0
})

const restDate = ref('')
const recommendedRestDate = ref('')

// Watch field changes to update plantingArea
watch(field, (newField) => {
  if (newField) {
    plantingForm.plantingArea = newField.area
  }
}, { immediate: true })

const seedingRateInfo = computed(() => {
  if (!plantingForm.crop) return null
  return SEEDING_RATES[plantingForm.crop]
})

const expectedYield = computed(() => {
  if (!planting.value || !field.value) return 0
  return calculateExpectedYield(
    planting.value.crop,
    field.value.soilType,
    planting.value.seedAmount,
    planting.value.plantingArea,
    appliedFertilizers.value
  )
})

const fertilizerRecommendations = computed(() => {
  if (!planting.value || !field.value) return []
  return generateFertilizerRecommendations(
    planting.value.crop,
    field.value.soilType,
    planting.value.plantingDate,
    appliedFertilizers.value
  )
})

const healthScore = computed(() => {
  if (!planting.value || !field.value) return 0
  return calculateHealthScore(planting.value, appliedFertilizers.value, field.value.soilType)
})

const daysUntilHarvest = computed(() => {
  if (!planting.value) return 0
  return getDaysUntilHarvest(planting.value.expectedHarvestDate)
})

const recommendedCrop = computed((): CropType | null => {
  if (!field.value) return null
  const rec = generateFieldRecommendation(field.value, plantingsStore.plantings, harvestsStore.harvests)
  return rec!.recommendedCrop
})

const submitPlanting = () => {
  if (!field.value || !plantingForm.plantingDate) return

  const plantingDate = new Date(plantingForm.plantingDate)
  const expectedHarvestDate = calculateHarvestDate(plantingDate, plantingForm.crop)
  
  plantingsStore.addPlanting({
    fieldId: field.value.id,
    crop: plantingForm.crop,
    variety: plantingForm.variety,
    seedProducer: plantingForm.seedProducer,
    plantingArea: plantingForm.plantingArea,
    seedAmount: plantingForm.seedAmount,
    plantingDate,
    expectedHarvestDate
  })

  fieldsStore.updateField(field.value.id, { status: 'Засеяно' })

  // Очистка формы
  plantingForm.crop = '' as CropType
  plantingForm.variety = ''
  plantingForm.seedProducer = ''
  plantingForm.plantingArea = 0
  plantingForm.seedAmount = 0
  plantingForm.plantingDate = new Date().toISOString().substring(0, 10)

  showPlantingModal.value = false
}

const submitHarvest = () => {
  if (!planting.value || !field.value) return

  harvestsStore.addHarvest({
    plantingId: planting.value.id,
    harvestDate: new Date(),
    actualYield: harvestForm.actualYield,
    quality: harvestForm.quality
  })

  plantingsStore.updatePlanting(planting.value.id, { harvested: true })
  fieldsStore.updateField(field.value.id, { status: 'Убрано' })
  showHarvestModal.value = false
}

const submitFertilizer = () => {
  if (!planting.value || !fertilizerForm.applicationDate) return

  fertilizationsStore.addFertilization({
    plantingId: planting.value.id,
    fertilizerType: fertilizerForm.fertilizerType,
    fertilizerName: fertilizerForm.fertilizerName,
    amount: fertilizerForm.amount,
    applicationDate: new Date(fertilizerForm.applicationDate),
    cost: fertilizerForm.cost
  })
  
  fertilizerForm.fertilizerType = '' as FertilizerType
  fertilizerForm.fertilizerName = ''
  fertilizerForm.amount = 0
  fertilizerForm.cost = 0
  showAddFertilizerModal.value = false
}

const setFieldResting = () => {
  if (field.value) {
    const history = getFieldHistory(field.value.id, plantingsStore.plantings, harvestsStore.harvests)
    const lastCrop = history[0]?.crop || null
    let recommendedDate = new Date()
    if (lastCrop) {
      const rule = CROP_ROTATION_RULES[lastCrop]
      recommendedDate.setFullYear(recommendedDate.getFullYear() + rule.restPeriod)
    } else {
      recommendedDate.setFullYear(recommendedDate.getFullYear() + 1)
    }
    recommendedRestDate.value = recommendedDate.toISOString().substring(0, 10)
    restDate.value = recommendedRestDate.value
    showRestModal.value = true
  }
}

const confirmRest = () => {
  if (field.value) {
    const dateStr = restDate.value
    if (dateStr) {
      fieldsStore.updateField(field.value.id, { status: 'Отдыхает', nextPlantingDate: new Date(dateStr) })
      showRestModal.value = false
    }
  }
}

const prepareForPlanting = () => {
  if (field.value) {
    fieldsStore.updateField(field.value.id, { status: 'Не засеяно' })
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

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
