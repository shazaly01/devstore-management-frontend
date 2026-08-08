<template>
  <Transition
    enter-active-class="transition ease-out duration-300 transform"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition ease-in duration-200 transform"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <AppCard
      v-if="props.formState.is_composite"
      class="border border-fuchsia-500/20 shadow-lg shadow-fuchsia-950/5"
    >
      <div class="p-5 space-y-4">
        <!-- ترويسة قسم التركيب والتجميع -->
        <div class="flex justify-between items-center border-b border-surface-border pb-3">
          <div>
            <h3 class="text-sm font-black text-fuchsia-400 flex items-center gap-2">
              <span>⚙️</span> تركيب ومكونات الصنف التجميعي
            </h3>
            <p class="text-[11px] text-text-muted mt-0.5">
              حدد المواد الخام والمنتجات الفرعية التي يتكون منها هذا الصنف لضبط الخصم التلقائي من
              المخازن.
            </p>
          </div>
          <AppButton
            type="button"
            variant="secondary"
            size="sm"
            class="!border-fuchsia-500/30 hover:!bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold transition-all"
            @click="addComponentRow"
          >
            + إضافة مادة خام / مكون
          </AppButton>
        </div>

        <!-- حالة عدم وجود مكونات بعد -->
        <div
          v-if="!props.formState.components || props.formState.components.length === 0"
          class="text-center py-10 bg-surface-ground/30 rounded-xl border border-dashed border-surface-border/80 text-text-muted text-xs italic"
        >
          لم يتم إدراج أي مكونات لهذا الصنف التجميعي بعد. اضغط على "+ إضافة مادة خام / مكون" للبدء
          في ربط المواد.
        </div>

        <!-- جدول الأسطر التفاعلي للمكونات -->
        <div v-else class="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
          <div
            v-for="(row, index) in props.formState.components"
            :key="index"
            class="p-3 bg-surface-ground rounded-xl border border-surface-border/60 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 transition-all hover:border-surface-border relative group"
          >
            <!-- 1. اختيار المكون (المادة الخام) -->
            <div class="flex-1">
              <label class="block text-[10px] font-bold text-text-secondary mb-1.5"
                >اختر المكون / المادة الخام</label
              >
              <AppDropdown
                :id="'component-dropdown-' + index"
                :model-value="row.child_item_id"
                :options="filteredAvailableItems"
                option-label="name"
                option-value="id"
                placeholder="ابحث واختر من المنتجات أو الخامات..."
                :show-clear="false"
                @update:model-value="
                  (val) =>
                    modifyComponentRowField(
                      index,
                      'child_item_id',
                      val !== null ? Number(val) : null,
                    )
                "
              />
            </div>

            <!-- 2. كمية المكون المطلوبة للتركيب -->
            <div class="w-full sm:w-44">
              <label
                class="block text-[10px] font-bold text-text-secondary mb-1.5 text-center sm:text-right"
              >
                الكمية المطلوبة (بالوحدة الصغرى)
              </label>
              <AppInput
                :id="'component-qty-' + index"
                type="number"
                step="0.001"
                min="0.001"
                :model-value="row.quantity"
                input-class="text-center font-bold font-mono"
                placeholder="1.000"
                @update:model-value="
                  (val) => modifyComponentRowField(index, 'quantity', Number(val))
                "
              />
            </div>

            <!-- 3. زر الحذف السريع للسطر -->
            <div class="flex justify-center items-center h-10 self-center sm:self-end mb-0.5">
              <button
                type="button"
                @click="removeComponentRow(index)"
                class="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors shrink-0"
                title="حذف هذا المكون"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <!-- عرض أخطاء التحقق القادمة من الباك إند للـ Components بشكل منسق -->
        <!-- عرض أخطاء التحقق القادمة من الباك إند للـ Components بشكل منسق -->
        <div
          v-if="itemStore.validationErrors && hasComponentErrors"
          class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 animate-fade-in"
        >
          <p class="text-rose-400 text-xs font-black">
            يرجى تصحيح أخطاء المكونات التجميعية التالية:
          </p>
          <div class="text-rose-500 dark:text-rose-400 text-[11px] font-bold pl-2 space-y-0.5">
            <template v-for="(errorsArray, fieldKey) in itemStore.validationErrors" :key="fieldKey">
              <!-- [الحل]: فصل الـ v-if في template مستقل لمنع تداخلها مع الـ v-for على نفس العنصر -->
              <template v-if="fieldKey.startsWith('components')">
                <p v-for="(err, i) in errorsArray" :key="i">• {{ err }}</p>
              </template>
            </template>
          </div>
        </div>
      </div>
    </AppCard>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import AppCard from '@/components/ui/AppCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'

const props = defineProps({
  formState: { type: Object, required: true },
})

const emit = defineEmits(['update:formState', 'clear-error'])

const route = useRoute()
const itemStore = useItemStore()

// معرف الصنف الحالي في حالة التعديل لتجنب ظهوره في قائمة الاختيارات
const currentItemId = computed(() => (route.params.id ? Number(route.params.id) : null))

/**
 * تصفية الأصناف المتاحة للتركيب:
 * 1. استبعاد الصنف التجميعي الأب نفسه لمنع حدوث تكرار حلقي دائم في قواعد البيانات.
 * 2. تصفية الأصناف من نوع (product أو raw_material).
 */
const filteredAvailableItems = computed(() => {
  return (itemStore.items || []).filter((item) => {
    const isSelf = currentItemId.value && item.id === currentItemId.value
    const isValidType = item.item_type === 'product' || item.item_type === 'raw_material'
    return !isSelf && isValidType
  })
})

/**
 * التحقق من وجود أي أخطاء تحقق تابعة لجدول المكونات
 */
const hasComponentErrors = computed(() => {
  if (!itemStore.validationErrors) return false
  return Object.keys(itemStore.validationErrors).some((key) => key.startsWith('components'))
})

/**
 * تعديل خلايا سطر المكونات في الـ State وتمرير التحديث للأب
 */
const modifyComponentRowField = (index, field, value) => {
  emit('clear-error', 'components')

  const clonedComponents = (props.formState.components || []).map((component, idx) => {
    if (idx !== index) return component
    return {
      ...component,
      [field]: value,
    }
  })

  emit('update:formState', {
    ...props.formState,
    components: clonedComponents,
  })
}

/**
 * إضافة سطر مكون جديد افتراضي
 */
const addComponentRow = () => {
  emit('clear-error', 'components')

  const currentComponents = props.formState.components || []
  const updatedComponents = [
    ...currentComponents,
    {
      child_item_id: null,
      quantity: 1,
    },
  ]

  emit('update:formState', {
    ...props.formState,
    components: updatedComponents,
  })
}

/**
 * حذف سطر مكون معين من المصفوفة
 */
const removeComponentRow = (index) => {
  emit('clear-error', 'components')

  const updatedComponents = (props.formState.components || []).filter((_, idx) => idx !== index)

  emit('update:formState', {
    ...props.formState,
    components: updatedComponents,
  })
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}
:global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input[type='number'] {
  -moz-appearance: textfield;
}
</style>
