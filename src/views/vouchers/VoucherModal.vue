<!--src/views/vouchers/VoucherModal.vue-->
<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="modelValue"
      class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-40 p-3 sm:p-4"
      @click.self="close"
    >
      <Transition
        appear
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          class="bg-surface-section border border-surface-border border-t-4 border-t-primary rounded-2xl shadow-2xl w-full max-w-3xl transform overflow-y-auto max-h-[92vh] custom-scrollbar text-right font-sans"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="modalTitle"
          dir="rtl"
        >
          <!-- ترويسة مصقولة للنافذة مع شارة نوع السند -->
          <div
            class="px-4 sm:px-5 py-3 bg-surface-header border-b border-surface-border flex justify-between items-center gap-3"
          >
            <div class="flex items-center gap-2.5">
              <span
                class="w-2.5 h-5 rounded-full shrink-0"
                :class="voucher?.voucher_type === 'receipt' ? 'bg-success' : 'bg-danger'"
              ></span>
              <h3 id="modal-title" class="text-base sm:text-lg font-black text-text-primary">
                {{ modalTitle }}
              </h3>
              <span
                class="text-[10px] px-2 py-0.5 rounded-full font-bold border whitespace-nowrap"
                :class="
                  voucher?.voucher_type === 'receipt'
                    ? 'bg-success/15 text-success border-success/35'
                    : 'bg-danger/15 text-danger border-danger/35'
                "
              >
                {{ voucher?.voucher_type === 'receipt' ? 'قبض مالي' : 'صرف مالي' }}
              </span>
            </div>

            <button
              type="button"
              @click="close"
              class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-card/80 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>

          <!-- محتوى نموذج السند -->
          <div class="p-3.5 sm:p-4">
            <VoucherForm
              :initial-data="voucher"
              :is-saving="isSaving"
              :accounts="accounts"
              :validation-errors="validationErrors"
              :is-type-disabled="isTypeDisabled"
              @submit="handleFormSubmit"
              @cancel="close"
            />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import VoucherForm from './VoucherForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  voucher: {
    type: Object,
    default: null,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  accounts: {
    type: Array,
    required: true,
  },
  validationErrors: {
    type: Object,
    default: null,
  },
  isTypeDisabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'save'])

const modalTitle = computed(() => {
  const isReceipt = props.voucher?.voucher_type === 'receipt'

  if (props.voucher && props.voucher.id) {
    const prefix = isReceipt ? 'تعديل سند قبض' : 'تعديل سند صرف'
    return `${prefix} رقم (${props.voucher.voucher_number || props.voucher.id})`
  } else {
    return isReceipt ? 'إنشاء سند قبض جديد' : 'إنشاء سند صرف جديد'
  }
})

const close = () => {
  emit('update:modelValue', false)
}

const handleFormSubmit = (formData) => {
  emit('save', formData)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-surface-border));
  border-radius: 10px;
}
</style>
