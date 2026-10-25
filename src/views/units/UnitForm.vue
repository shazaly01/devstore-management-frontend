<!--src/views/units/UnitForm.vue-->
<template>
  <form @submit.prevent="handleSubmit" dir="rtl">
    <div class="space-y-5 text-right">
      <div>
        <AppInput
          id="unit-name"
          label="اسم الوحدة"
          v-model="form.name"
          placeholder="مثال: حبة، كرتون، كيلو، متر"
          required
        />
        <p v-if="errors.name" class="text-danger text-xs mt-1 font-bold">
          اسم الوحدة مطلوب (مثال: حبة، كرتون).
        </p>
      </div>

      <div>
        <AppInput
          id="unit-short-name"
          label="الاسم المختصر / الرمز"
          v-model="form.short_name"
          placeholder="مثال: حبة، كرتونة، كجم، م"
        />
      </div>
    </div>

    <div class="mt-8 flex justify-end space-x-3 space-x-reverse">
      <AppButton type="button" variant="secondary" @click="handleCancel"> إلغاء </AppButton>
      <AppButton type="submit" :disabled="isSaving">
        <span v-if="isSaving">جاري الحفظ...</span>
        <span v-else>حفظ الوحدة</span>
      </AppButton>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, reactive } from 'vue'

import AppInput from '@/components/ui/AppInput.vue'
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

const errors = reactive({
  name: false,
})

const createFreshForm = () => ({
  id: null,
  name: '',
  short_name: '',
})

const form = ref(createFreshForm())

watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      form.value = {
        id: newData.id,
        name: newData.name || '',
        short_name: newData.short_name || '',
      }
    } else {
      form.value = createFreshForm()
    }
  },
  { immediate: true, deep: true },
)

const handleSubmit = () => {
  errors.name = false

  if (!form.value.name || !form.value.name.trim()) {
    errors.name = true
    return
  }

  emit('submit', { ...form.value })
}

const handleCancel = () => {
  emit('cancel')
}
</script>
