<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-[#1c1917]">Фермеры</h1>
        <p class="text-[#78716c] mt-1">Управление списком фермеров</p>
      </div>
      <button
        @click="showAddModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-[#22c55e] text-white rounded-lg hover:bg-[#16a34a] transition-colors"
      >
        <Plus class="w-5 h-5" />
        Добавить фермера
      </button>
    </div>

    <!-- Farmers Table -->
    <div class="bg-white rounded-xl border border-[#e7e5e4] overflow-hidden">
      <table class="w-full">
        <thead class="bg-[#f5f5f4]">
          <tr>
            <th class="px-6 py-4 text-left text-sm font-semibold text-[#1c1917]">Имя</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-[#1c1917]">Email</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-[#1c1917]">Телефон</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-[#1c1917]">Полей</th>
            <th class="px-6 py-4 text-left text-sm font-semibold text-[#1c1917]">Дата регистрации</th>
            <th class="px-6 py-4 text-right text-sm font-semibold text-[#1c1917]">Действия</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#e7e5e4]">
          <tr
            v-for="farmer in farmersStore.farmers"
            :key="farmer.id"
            class="hover:bg-[#f5f5f4] transition-colors"
          >
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                  <User class="w-5 h-5 text-[#22c55e]" />
                </div>
                <span class="font-medium text-[#1c1917]">{{ farmer.name }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-[#57534e]">{{ farmer.email }}</td>
            <td class="px-6 py-4 text-[#57534e]">{{ farmer.phone }}</td>
            <td class="px-6 py-4 text-[#57534e]">
              {{ fieldsStore.getFieldsByFarmerId(farmer.id).length }}
            </td>
            <td class="px-6 py-4 text-[#57534e]">
              {{ formatDate(farmer.createdAt) }}
            </td>
            <td class="px-6 py-4 text-right">
              <button
                @click="deleteFarmer(farmer.id)"
                class="p-2 text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add Farmer Modal -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-bold text-[#1c1917] mb-6">Добавить фермера</h2>
        <form @submit.prevent="addFarmer">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">ФИО</label>
              <input
                v-model="newFarmer.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Email</label>
              <input
                v-model="newFarmer.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="example@mail.ru"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-[#1c1917] mb-2">Телефон</label>
              <input
                v-model="newFarmer.phone"
                type="tel"
                required
                class="w-full px-4 py-2 border border-[#e7e5e4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22c55e]/50"
                placeholder="+7 (900) 123-45-67"
              />
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
              Добавить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Plus, User, Trash2 } from 'lucide-vue-next'
import { useFarmersStore } from '@/stores/farmers'
import { useFieldsStore } from '@/stores/fields'

const farmersStore = useFarmersStore()
const fieldsStore = useFieldsStore()

const showAddModal = ref(false)
const newFarmer = reactive({
  name: '',
  email: '',
  phone: ''
})

const addFarmer = () => {
  farmersStore.addFarmer({
    name: newFarmer.name,
    email: newFarmer.email,
    phone: newFarmer.phone
  })
  newFarmer.name = ''
  newFarmer.email = ''
  newFarmer.phone = ''
  showAddModal.value = false
}

const deleteFarmer = (id: string) => {
  if (confirm('Вы уверены, что хотите удалить этого фермера?')) {
    farmersStore.deleteFarmer(id)
  }
}

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}
</script>
