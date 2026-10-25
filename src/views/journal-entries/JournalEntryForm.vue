<!--src/views/journal-entries/JournalEntryForm.vue-->
<template>
  <div class="space-y-4 text-right font-sans pb-24" dir="rtl">
    <div class="flex justify-between items-center py-1 border-b border-surface-border/60">
      <div>
        <h1 class="text-base font-black text-text-primary flex items-center gap-2">
          <span class="inline-block w-1.5 h-3 bg-primary rounded-full"></span>
          {{ isEdit ? 'تعديل السند / القيد المالي' : 'تسجيل قيد يومية جديد' }}
        </h1>
      </div>
    </div>

    <div
      v-if="journalEntryStore.error"
      class="p-3 bg-danger/10 border border-danger/30 text-danger rounded-lg text-xs font-bold shadow-sm"
    >
      {{ journalEntryStore.error }}
    </div>

    <JournalEntryHeader v-model="form" :validation-errors="journalEntryStore.validationErrors" />

    <AppCard>
      <div class="space-y-4">
        <!-- حاوية البحث الذكي -->
        <div
          class="w-full text-xs bg-primary p-1 rounded-xl shadow-md shadow-primary/20 border border-primary transition-all duration-200"
        >
          <SmartSearchGrid
            ref="accountSearchRef"
            :data="activeSubAccounts"
            :columns="[
              { key: 'code', label: 'كود الحساب', class: 'text-right' },
              { key: 'name', label: 'اسم الحساب المالي المعتمد', class: 'text-right font-bold' },
            ]"
            :search-keys="['code', 'name']"
            placeholder="اكتب اسم الحساب المالي أو كود الدليل لترحيله الفوري للسطر الحركي..."
            @select="handleGlobalAccountSelect"
          />
        </div>

        <p
          v-if="getValidationError('lines')"
          class="p-2.5 bg-danger/10 text-danger rounded-lg text-xs font-bold border border-danger/30 shadow-sm"
        >
          {{ getValidationError('lines') }}
        </p>

        <InvoiceDetailTable
          :items="lines"
          :schema="visibleTableSchema"
          @remove-row="removeRow"
          @add-row-request="handleLastRowEnter"
        >
          <template #cell-debit="{ row, index }">
            <div class="flex flex-col w-full">
              <input
                type="number"
                step="0.01"
                min="0"
                v-model.number="row.debit"
                data-type="number"
                :data-row="index"
                data-col="debit"
                class="w-full p-1 bg-surface-ground border border-surface-border hover:border-primary/50 focus:border-primary focus:bg-surface-section rounded text-xs text-center font-mono text-primary font-bold outline-none transition-all focus:ring-1 focus:ring-primary/20"
              />
              <p
                v-if="getValidationError(`lines.${index}.debit`)"
                class="text-danger text-[9px] font-bold mt-0.5 text-center"
              >
                خطأ في القيمة
              </p>
            </div>
          </template>

          <template #cell-credit="{ row, index }">
            <div class="flex flex-col w-full">
              <input
                type="number"
                step="0.01"
                min="0"
                v-model.number="row.credit"
                data-type="number"
                :data-row="index"
                data-col="credit"
                class="w-full p-1 bg-surface-ground border border-surface-border hover:border-success/50 focus:border-success focus:bg-surface-section rounded text-xs text-center font-mono text-success font-bold outline-none transition-all focus:ring-1 focus:ring-success/20"
              />
              <p
                v-if="getValidationError(`lines.${index}.credit`)"
                class="text-danger text-[9px] font-bold mt-0.5 text-center"
              >
                خطأ في القيمة
              </p>
            </div>
          </template>
        </InvoiceDetailTable>
      </div>
    </AppCard>

    <JournalEntryFooter
      v-model:notes="form.notes"
      :total-debit="headerTotalDebit"
      :total-credit="headerTotalCredit"
      :validation-errors="journalEntryStore.validationErrors"
    />

    <div
      class="fixed bottom-0 right-0 left-0 bg-surface-card border-t border-surface-border p-3 shadow-[0_-4px_10px_rgba(0,0,0,0.06)] z-40 flex justify-between items-center px-6"
    >
      <div class="text-xs text-text-secondary font-medium">
        القيود المالية المرحلة تؤثر فوراً في ميزان المراجعة، الأستاذ العام، ومستويات السيولة النقدية
        للشركة.
      </div>
      <div class="flex items-center gap-3">
        <AppButton type="button" variant="secondary" size="sm" @click="handleCancel">
          إلغاء وتراجع
        </AppButton>
        <AppButton
          type="button"
          size="sm"
          :disabled="journalEntryStore.loading"
          @click="handleSubmit"
        >
          <span v-if="journalEntryStore.loading">جاري ترحيل السند الحالي...</span>
          <span v-else>{{ isEdit ? 'تحديث ومزامنة حركة القيد' : 'ترحيل وحفظ القيد النهائي' }}</span>
        </AppButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useJournalEntryStore } from '@/stores/journalEntryStore'
import { useDynamicDetails } from '@/composables/useDynamicDetails'
import { useToast } from 'vue-toastification'

import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import InvoiceDetailTable from '@/components/ui/dynamic-invoice/InvoiceDetailTable.vue'
import SmartSearchGrid from '@/components/ui/SmartSearchGrid.vue'
import JournalEntryHeader from './components/JournalEntryHeader.vue'
import JournalEntryFooter from './components/JournalEntryFooter.vue'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const journalEntryStore = useJournalEntryStore()
const accountSearchRef = ref(null)
const activeSubAccounts = ref([])

const isEdit = computed(() => !!route.params.id)

const form = ref({
  entry_number: '',
  entry_date: new Date().toISOString().substr(0, 10),
  type: 'journal',
  notes: '',
})

const lines = ref([])

const detailSchema = [
  {
    key: 'account_code',
    label: 'كود الحساب',
    widthClass: 'w-2/12',
    readonly: true,
    type: 'text',
    extractFromItem: (acc) => acc.code || '',
  },
  {
    key: 'account_name',
    label: 'الحساب المالي الفرعي المعتمد',
    widthClass: 'w-4/12',
    readonly: true,
    type: 'text',
    extractFromItem: (acc) => acc.name || '',
  },
  {
    key: 'account_id',
    extractFromItem: (acc) => acc.id,
  },
  {
    key: 'debit',
    label: 'مدين (Debit) *',
    type: 'number',
    defaultValue: 0,
    summary: true,
    widthClass: 'w-2/12',
  },
  {
    key: 'credit',
    label: 'دائن (Credit) *',
    type: 'number',
    defaultValue: 0,
    summary: true,
    widthClass: 'w-2/12',
  },
  {
    key: 'line_notes',
    label: 'البيان التوضيحي للسطر',
    type: 'text',
    placeholder: 'سجل بيان الحركة هنا...',
    widthClass: 'w-4/12',
  },
]

const visibleTableSchema = computed(() => detailSchema.filter((col) => col.label))

const { handleItemSelected, removeRow, calculateColumnTotal } = useDynamicDetails(
  lines,
  detailSchema,
  {
    uniqueKeys: [],
    mergeQtyKey: null,
  },
)

const handleGlobalAccountSelect = (selectedAccount) => {
  if (!selectedAccount) return
  handleItemSelected(selectedAccount)
}

const handleLastRowEnter = () => {
  nextTick(() => {
    const searchInput = accountSearchRef.value?.$el.querySelector('input')
    if (searchInput) {
      searchInput.focus()
      if (typeof searchInput.select === 'function') searchInput.select()
    }
  })
}

const headerTotalDebit = computed(() => calculateColumnTotal('debit'))
const headerTotalCredit = computed(() => calculateColumnTotal('credit'))

const getValidationError = (path) => {
  return journalEntryStore.validationErrors?.[path]?.[0] || null
}

onMounted(async () => {
  activeSubAccounts.value = [
    { id: 1, code: '1101001', name: 'خزينة الإدارة العامة' },
    { id: 2, code: '1102001', name: 'مصرف الجمهورية - الحساب الجاري' },
    { id: 3, code: '2101001', name: 'حساب الموردين الذمم الدائنة' },
    { id: 4, code: '4101001', name: 'إيرادات المبيعات العامة' },
    { id: 5, code: '5101001', name: 'مصروفات الإيجار العمومية' },
  ]

  if (isEdit.value) {
    await journalEntryStore.fetchJournalEntry(route.params.id)
    if (journalEntryStore.currentJournalEntry) {
      const cur = journalEntryStore.currentJournalEntry
      form.value = {
        entry_number: cur.entry_number,
        entry_date: cur.entry_date,
        type: cur.type,
        notes: cur.notes || '',
      }

      lines.value = cur.lines.map((ln) => ({
        account_id: ln.account_id,
        account_code: ln.account_code || '',
        account_name: ln.account_name || '',
        debit: parseFloat(ln.debit) || 0,
        credit: parseFloat(ln.credit) || 0,
        line_notes: ln.line_notes || '',
        _flashing: false,
      }))
    }
  }
})

const handleSubmit = async () => {
  const dynamicLinesPayload = lines.value
    .filter((row) => row.account_id)
    .map((row) => ({
      account_id: row.account_id,
      debit: parseFloat(row.debit) || 0,
      credit: parseFloat(row.credit) || 0,
      line_notes: row.line_notes || '',
    }))

  if (dynamicLinesPayload.length < 2) {
    toast.warning('يجب إدخال سطرين ماليين على الأقل لتكوين أطراف الحركة الحسابية.')
    return
  }

  const finalPayload = {
    ...form.value,
    lines: dynamicLinesPayload,
  }

  try {
    if (isEdit.value) {
      await journalEntryStore.updateJournalEntry(route.params.id, finalPayload)
      toast.success('تمت مزامنة قيد اليومية وتحديث الأثر المالي بنجاح.')
    } else {
      await journalEntryStore.createJournalEntry(finalPayload)
      toast.success('تم ترحيل وحفظ سند قيد اليومية بنجاح إلى الأستاذ العام.')
    }
    router.push('/app/journal-entries')
  } catch (err) {
    toast.error('فشلت عملية حفظ المستند، يرجى مراجعة قيم بنود الإدخال والاتزان الحسابي.')
  }
}

const handleCancel = () => {
  router.push('/app/journal-entries')
}
</script>
