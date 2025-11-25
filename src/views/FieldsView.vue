<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-[#1c1917]">Поля</h1>
        <p class="text-[#78716c] mt-1">Управление сельскохозяйственными полями</p>
      </div>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
      >
        <Plus class="w-5 h-5" />
        Создать поле
      </button>
    </div>

    <!-- Fields Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <RouterLink
        v-for="field in fieldsStore.fields"
        :key="field.id"
        :to="`/field/${field.id}`"
        class="bg-white rounded-xl border border-[#e7e5e4] p-6 hover:shadow-lg transition-shadow"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
            <Map class="w-6 h-6 text-[#22c55e]" />
          </div>
          <span
            class="px-3 py-1 rounded-full text-xs font-medium"
            :class="getStatusClass(field.status)"
          >
            {{ field.status === 'Отдыхает' && field.nextPlantingDate ? `Отдыхает до ${formatDate(field.nextPlantingDate)}` : field.status }}
          </span>
        </div>
        <h3 class="text-lg font-semibold text-[#1c1917] mb-2">{{ field.name }}</h3>
        <div class="space-y-2 text-sm text-[#57534e]">
          <div class="flex justify-between">
            <span>Площадь:</span>
            <span class="font-medium text-[#1c1917]">{{ field.area }} га</span>
          </div>
          <div class="flex justify-between">
            <span>Тип почвы:</span>
            <span class="font-medium text-[#1c1917]">{{ field.soilType }}</span>
          </div>
          <div class="flex justify-between">
            <span>Рельеф:</span>
            <span class="font-medium text-[#1c1917]">{{ field.relief }}</span>
          </div>
        </div>
        <div class="mt-4 pt-4 border-t border-[#e7e5e4]">
          <div class="flex items-center gap-2 text-sm text-[#78716c]">
            <User class="w-4 h-4" />
            <span>{{ getFarmerName(field.farmerId) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <!-- Add Field Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Создать поле</h2>
        <form @submit.prevent="addField">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Фермер</label>
              <select
                v-model="newField.farmerId"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="">Выберите фермера</option>
                <option v-for="farmer in farmersStore.farmers" :key="farmer.id" :value="farmer.id">
                  {{ farmer.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Название поля</label>
              <input
                v-model="newField.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="Южное поле"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Площадь (га)</label>
              <input
                v-model.number="newField.area"
                type="number"
                required
                min="1"
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="100"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Тип почвы</label>
              <select
                v-model="newField.soilType"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="">Выберите тип почвы</option>
                <option v-for="soil in soilTypes" :key="soil" :value="soil">{{ soil }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Рельеф</label>
              <select
                v-model="newField.relief"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option value="">Выберите рельеф</option>
                <option v-for="relief in reliefTypes" :key="relief" :value="relief">{{ relief }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Статус</label>
              <select
                v-model="newField.status"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50 bg-white"
              >
                <option v-for="status in fieldStatuses" :key="status" :value="status">{{ status }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="showAddModal = false"
              class="px-4 py-2 text-[#57534e] hover:bg-[#f5f5f4] rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { RouterLink } from 'vue-router'
import { Plus, Map, User } from 'lucide-vue-next'
import { useFarmersStore } from '@/stores/farmers'
import { useFieldsStore } from '@/stores/fields'
import type { FieldStatus, SoilType, ReliefType } from '@/types'

const farmersStore = useFarmersStore()
const fieldsStore = useFieldsStore()

const showAddModal = ref(false)

const soilTypes: SoilType[] = ['Чернозем', 'Суглинок', 'Песчаная', 'Глинистая', 'Супесчаная']
const reliefTypes: ReliefType[] = ['Равнинный', 'Холмистый', 'Склон', 'Низина']
const fieldStatuses: FieldStatus[] = ['Не засеяно', 'Засеяно', 'Готово к сбору', 'Убрано', 'Отдыхает']

const newField = reactive({
  farmerId: '',
  name: '',
  area: 0,
  soilType: '' as SoilType,
  relief: '' as ReliefType,
  status: 'Не засеяно' as FieldStatus
})

const addField = () => {
  fieldsStore.addField({
    farmerId: newField.farmerId,
    name: newField.name,
    area: newField.area,
    soilType: newField.soilType,
    relief: newField.relief,
    status: newField.status
  })
  newField.farmerId = ''
  newField.name = ''
  newField.area = 0
  newField.soilType = '' as SoilType
  newField.relief = '' as ReliefType
  newField.status = 'Не засеяно'
  showAddModal.value = false
}

const getFarmerName = (farmerId: string): string => {
  const farmer = farmersStore.getFarmerById(farmerId)
  return farmer?.name || 'Неизвестный'
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

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>
