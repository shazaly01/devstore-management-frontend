<!--src/views/categories/CategoryForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" dir="rtl">
    <div class="space-y-5 text-right">
      <div>
        <AppInput
          id="category-name"
          label="اسم التصنيف"
          v-model="form.name"
          placeholder="ادخل اسم التصنيف (مثال: المأكولات، الأجهزة الإلكترونية)"
          required
          @input="clearBackendError('name')"
        />
        <p v-if="errors.name" class="text-danger text-xs mt-1 font-bold">
          اسم التصنيف مطلوب ولا يمكن تركه فارغاً.
        </p>
        <div v-if="validationErrors && validationErrors.name">
          <p
            v-for="(error, index) in validationErrors.name"
            :key="index"
            class="text-danger text-xs mt-1 font-bold"
          >
            {{ error }}
          </p>
        </div>
      </div>

      <div>
        <AppDropdown
          id="category-parent"
          label="التصنيف الرئيسي (الأب)"
          v-model="form.parent_id"
          :options="parentOptions"
          placeholder="اختر التصنيف الأب (اختياري - لجعله تصنيفاً فرعياً)"
          @change="clearBackendError('parent_id')"
        />
        <div v-if="validationErrors && validationErrors.parent_id">
          <p
            v-for="(error, index) in validationErrors.parent_id"
            :key="index"
            class="text-danger text-xs mt-1 font-bold"
          >
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ التصنيف</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive, computed } from 'vue'
import { useCategoryStore } from '@/stores/categoryStore'
import { storeToRefs } from 'pinia'

import AppInput from '@/components/ui/AppInput.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppButton from '@/components/ui/AppButton.vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const categoryStore = useCategoryStore()
const { categories, validationErrors } = storeToRefs(categoryStore)

const errors = reactive({
  name: false,
})

const createFreshForm = () => ({
  id: null,
  name: '',
  parent_id: '',
})

const form = ref(createFreshForm())

const parentOptions = computed(() => {
  return categories.value
    .filter((cat) => !form.value.id || cat.id !== form.value.id)
    .map((cat) => ({
      id: cat.id,
      name: cat.full_path || cat.name,
    }))
})

watch(
  () => props.initialData,
  (newData) => {
    if (categoryStore.validationErrors) {
      categoryStore.validationErrors = null
    }

    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        parent_id: newData.parent_id || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const clearBackendError = (field) => {
  if (validationErrors.value && validationErrors.value[field]) {
    delete validationErrors.value[field]
  }
}

const handleSubmit = () => {
  errors.name = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  const payload = {
    ...form.value,
    parent_id: form.value.parent_id ? Number(form.value.parent_id) : null,
  }

  emit('submit', payload)
}

const handleCancel = () => {
  if (categoryStore.validationErrors) {
    categoryStore.validationErrors = null
  }
  emit('cancel')
}
</script>
