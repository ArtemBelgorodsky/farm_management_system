export interface Farmer {
  id: string
  name: string
  email: string
  phone: string
  createdAt: Date
}

export type FieldStatus = "Не засеяно" | "Засеяно" | "Готово к сбору" | "Убрано" | "Отдыхает"
export type SoilType = "Чернозем" | "Суглинок" | "Песчаная" | "Глинистая" | "Супесчаная"
export type ReliefType = "Равнинный" | "Холмистый" | "Склон" | "Низина"

export interface Field {
  id: string
  farmerId: string
  name: string
  area: number // площадь в гектарах
  soilType: SoilType
  relief: ReliefType
  status: FieldStatus
  createdAt: Date
  nextPlantingDate?: Date
}

export type CropType = "Пшеница" | "Кукуруза" | "Подсолнечник" | "Соя" | "Рапс" | "Ячмень" | "Овес" | "Горох"

export interface Planting {
  id: string
  fieldId: string
  crop: CropType
  variety: string
  seedProducer: string
  plantingArea: number // площадь посева в гектарах
  seedAmount: number // количество в кг
  plantingDate: Date
  expectedHarvestDate: Date
  harvested?: boolean
}

export interface Harvest {
  id: string
  plantingId: string
  harvestDate: Date
  actualYield: number // урожайность в тоннах
  quality: "Отличное" | "Хорошее" | "Среднее" | "Низкое"
}

export type FertilizerType = "Азотные" | "Фосфорные" | "Калийные" | "Органические" | "Комплексные"

export interface Fertilization {
  id: string
  plantingId: string
  fertilizerType: FertilizerType
  fertilizerName: string
  amount: number // кг на га
  applicationDate: Date
  cost: number
}

export interface Analytics {
  fieldId: string
  expectedYield: number // ожидаемая урожайность в т/га
  optimalHarvestDate: Date
  recommendedFertilizers: FertilizerRecommendation[]
  wateringSchedule: Date[]
  healthScore: number // 0-100
}

export interface FertilizerRecommendation {
  type: FertilizerType
  name: string
  amount: number
  applicationDate: Date
  expectedEffect: string
}

export interface CropRotationRule {
  crop: CropType
  goodPredecessors: CropType[]
  badPredecessors: CropType[]
  restPeriod: number // лет
  soilRestoration: number // процент восстановления почвы
}

export interface Recommendation {
  fieldId: string
  recommendedCrop: CropType
  reason: string
  expectedYield: number
  profitability: number // рентабельность в процентах
  riskLevel: "Низкий" | "Средний" | "Высокий"
}
