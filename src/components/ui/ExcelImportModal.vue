<!--src/components/common/ExcelImportModal.vue-->
<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300"
  >
    <div
      class="relative w-full max-w-4xl bg-surface-section rounded-2xl border border-surface-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
    >
      <!-- رأس النافذة المنبثقة -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-surface-border bg-surface-ground/50 flex-shrink-0"
      >
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-primary/10 text-primary">
            <ArrowUpTrayIcon class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-text-primary">{{ title }}</h3>
            <p class="text-xs text-text-muted">
              استيراد مجمع للبيانات مع مطابقة الأعمدة والمعاينة التفاعلية
            </p>
          </div>
        </div>

        <button
          @click="closeModal"
          class="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-ground transition-colors cursor-pointer"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <!-- مؤشر خطوات المعالجة -->
      <div
        class="flex items-center justify-center px-6 py-3 border-b border-surface-border bg-surface-section gap-8 text-xs font-bold"
      >
        <div
          class="flex items-center gap-2"
          :class="
            currentStep === 1
              ? 'text-primary'
              : currentStep > 1
                ? 'text-emerald-500'
                : 'text-text-muted'
          "
        >
          <span
            class="flex items-center justify-center w-6 h-6 rounded-full border text-[11px]"
            :class="
              currentStep === 1
                ? 'border-primary bg-primary/10 text-primary'
                : currentStep > 1
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-surface-border text-text-muted'
            "
          >
            <CheckIcon v-if="currentStep > 1" class="h-3.5 w-3.5" />
            <span v-else>1</span>
          </span>
          <span>1. اختيار الملف</span>
        </div>

        <div class="w-8 h-px bg-surface-border"></div>

        <div
          class="flex items-center gap-2"
          :class="
            currentStep === 2
              ? 'text-primary'
              : currentStep > 2
                ? 'text-emerald-500'
                : 'text-text-muted'
          "
        >
          <span
            class="flex items-center justify-center w-6 h-6 rounded-full border text-[11px]"
            :class="
              currentStep === 2
                ? 'border-primary bg-primary/10 text-primary'
                : currentStep > 2
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-surface-border text-text-muted'
            "
          >
            <CheckIcon v-if="currentStep > 2" class="h-3.5 w-3.5" />
            <span v-else>2</span>
          </span>
          <span>2. مطابقة الأعمدة</span>
        </div>

        <div class="w-8 h-px bg-surface-border"></div>

        <div
          class="flex items-center gap-2"
          :class="currentStep === 3 ? 'text-primary' : 'text-text-muted'"
        >
          <span
            class="flex items-center justify-center w-6 h-6 rounded-full border text-[11px]"
            :class="
              currentStep === 3
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-surface-border text-text-muted'
            "
          >
            3
          </span>
          <span>3. المعاينة والاعتماد</span>
        </div>
      </div>

      <!-- محتوى الخطوات التفاعلي -->
      <div class="p-6 overflow-y-auto flex-1 space-y-4">
        <!-- رسائل التنبيه والأخطاء -->
        <div
          v-if="errorMessage"
          class="p-4 rounded-xl bg-danger/10 border border-danger/20 flex items-start gap-3 text-danger text-xs font-semibold"
        >
          <ExclamationTriangleIcon class="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p>{{ errorMessage }}</p>
            <ul v-if="validationList.length > 0" class="list-disc list-inside space-y-0.5">
              <li v-for="(err, idx) in validationList" :key="idx">{{ err }}</li>
            </ul>
          </div>
        </div>

        <!-- الخطوة 1: اختيار ورفع الملف -->
        <div v-if="currentStep === 1" class="py-6">
          <div
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleFileDrop"
            class="border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center"
            :class="[
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-surface-border hover:border-primary/50 hover:bg-surface-ground/30',
            ]"
            @click="triggerFileInput"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept=".xlsx, .xls, .csv"
              class="hidden"
              @change="handleFileSelect"
            />
            <div
              class="h-16 w-16 mb-4 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner"
            >
              <ArrowUpTrayIcon class="h-8 w-8" />
            </div>
            <h4 class="text-sm font-bold text-text-primary mb-1">
              اسحب وأفلت ملف الإكسيل هنا، أو انقر للتصفح
            </h4>
            <p class="text-xs text-text-muted">
              يدعم ملفات (.xlsx, .xls, .csv) ويقرأ كافة أوراق العمل المدمجة
            </p>
          </div>
        </div>

        <!-- الخطوة 2: اختيار ورقة العمل ومطابقة الأعمدة -->
        <div v-if="currentStep === 2" class="space-y-4">
          <!-- شريط اختيار ورقة العمل من القائمة المنسدلة -->
          <div
            class="p-3.5 bg-surface-ground/60 rounded-xl border border-surface-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-text-secondary whitespace-nowrap"
                >ورقة العمل المستهدفة (Sheet):</span
              >
              <span class="text-[11px] text-text-muted"
                >اختر الورقة التي تحتوي على بيانات الأصناف</span
              >
            </div>

            <div class="relative min-w-[220px]">
              <select
                v-model="selectedSheet"
                @change="onSheetChange"
                class="block w-full py-2 pr-3 pl-8 text-xs font-bold bg-surface-section border border-surface-border rounded-lg text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option v-for="sheetName in availableSheets" :key="sheetName" :value="sheetName">
                  {{ sheetName }}
                </option>
              </select>
              <div
                class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-text-muted text-[10px]"
              >
                ▼
              </div>
            </div>
          </div>

          <!-- شريط معلومات الأعمدة والصفوف المكتشفة -->
          <div class="flex items-center justify-between pb-2 border-b border-surface-border">
            <span class="text-xs font-bold text-text-secondary">
              تم العثور على ({{ excelHeaders.length }}) عمود بإجمالي ({{ rawRows.length }}) صف
              بيانات داخل ورقة [{{ selectedSheet }}].
            </span>
            <AppButton size="sm" variant="outline" @click="autoDetectMapping">
              <ArrowPathIcon class="h-3.5 w-3.5 ml-1" />
              إعادة الكشف التلقائي
            </AppButton>
          </div>

          <!-- شبكة مطابقة الأعمدة -->
          <div class="grid grid-cols-1 gap-3">
            <div
              v-for="field in targetFields"
              :key="field.key"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-surface-border bg-surface-ground/40"
            >
              <div class="sm:w-1/3">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-text-primary">{{ field.label }}</span>
                  <AppBadge v-if="field.required" size="xs" variant="danger">إلزامي</AppBadge>
                  <AppBadge v-else size="xs" variant="neutral">اختياري</AppBadge>
                </div>
                <span class="text-[11px] text-text-muted block mt-0.5">{{
                  field.description || 'حقل من حقول النظام'
                }}</span>
              </div>

              <div class="sm:w-2/3 flex items-center gap-3">
                <div class="flex-1">
                  <AppDropdown
                    :id="`field_${field.key}`"
                    v-model="fieldMapping[field.key]"
                    :options="excelHeaderOptions"
                    option-label="label"
                    option-value="value"
                    placeholder="-- تجاهل هذا الحقل --"
                    :show-clear="!field.required"
                  />
                </div>

                <div
                  v-if="fieldMapping[field.key]"
                  class="hidden md:block w-40 text-[11px] text-text-muted truncate bg-surface-section px-2.5 py-1.5 rounded-lg border border-surface-border/60"
                  :title="`عينة: ${getSampleValue(fieldMapping[field.key])}`"
                >
                  عينة: {{ getSampleValue(fieldMapping[field.key]) }}
                </div>
                <div
                  v-else-if="field.defaultValue"
                  class="hidden md:block w-40 text-[11px] text-primary truncate bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/20"
                >
                  افتراضي: {{ field.defaultValue }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- الخطوة 3: جدول المعاينة الحية للبيانات المنسقة -->
        <div v-if="currentStep === 3" class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-text-secondary">
              معاينة عينة من أول 5 أسطر بعد المطابقة من ورقة [{{ selectedSheet }}]:
            </span>
            <AppBadge size="md" variant="primary">
              إجمالي الصفوف الجاهزة: {{ rawRows.length }}
            </AppBadge>
          </div>

          <AppTable :headers="previewHeaders" :items="previewRows" :row-clickable="false" />
        </div>
      </div>

      <!-- فوتر النافذة وأزرار التحكم بالخطوات -->
      <div
        class="flex items-center justify-between px-6 py-4 border-t border-surface-border bg-surface-ground/50 flex-shrink-0"
      >
        <AppButton
          v-if="currentStep > 1"
          variant="secondary"
          size="sm"
          :disabled="isSubmitting"
          @click="currentStep--"
        >
          <ChevronRightIcon class="h-4 w-4 ml-1" />
          السابق
        </AppButton>
        <div v-else></div>

        <div class="flex items-center gap-3">
          <AppButton variant="secondary" size="sm" :disabled="isSubmitting" @click="closeModal">
            إلغاء
          </AppButton>

          <AppButton
            v-if="currentStep === 1"
            variant="primary"
            size="sm"
            :disabled="rawRows.length === 0"
            @click="currentStep = 2"
          >
            متابعة للمطابقة
            <ChevronLeftIcon class="h-4 w-4 mr-1" />
          </AppButton>

          <AppButton
            v-if="currentStep === 2"
            variant="primary"
            size="sm"
            :disabled="rawRows.length === 0"
            @click="validateAndGoToPreview"
          >
            معاينة البيانات
            <ChevronLeftIcon class="h-4 w-4 mr-1" />
          </AppButton>

          <AppButton
            v-if="currentStep === 3"
            variant="success"
            size="sm"
            :disabled="isSubmitting"
            @click="handleFinalSubmit"
          >
            <span v-if="isSubmitting">جاري الاستيراد...</span>
            <span v-else>اعتماد واستيراد البيانات</span>
            <CheckCircleIcon v-if="!isSubmitting" class="h-4 w-4 mr-1.5" />
          </AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import * as XLSX from 'xlsx'
import AppButton from '@/components/ui/AppButton.vue'
import AppDropdown from '@/components/ui/AppDropdown.vue'
import AppTable from '@/components/ui/AppTable.vue'
import AppBadge from '@/components/ui/AppBadge.vue'
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: 'استيراد البيانات من إكسيل',
  },
  targetFields: {
    type: Array,
    required: true,
  },
  submitHandler: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue', 'success'])

const currentStep = ref(1)
const isDragging = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref(null)
const validationList = ref([])
const fileInputRef = ref(null)

const availableSheets = ref([])
const selectedSheet = ref('')
let cachedWorkbook = null

const excelHeaders = ref([])
const rawRows = ref([])
const fieldMapping = reactive({})

const excelHeaderOptions = computed(() => {
  return [
    { label: '-- تجاهل هذا الحقل --', value: null },
    ...excelHeaders.value.map((h) => ({ label: h, value: h })),
  ]
})

function triggerFileInput() {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (file) {
    parseExcelFile(file)
  }
}

function handleFileDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    parseExcelFile(file)
  }
}

function parseExcelFile(file) {
  errorMessage.value = null
  validationList.value = []

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      cachedWorkbook = workbook
      availableSheets.value = workbook.SheetNames

      let defaultSheet = workbook.SheetNames[0]
      for (const sheetName of workbook.SheetNames) {
        const testRows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
        if (testRows && testRows.length > 0) {
          defaultSheet = sheetName
          break
        }
      }

      selectedSheet.value = defaultSheet
      loadSheetData(defaultSheet)

      currentStep.value = 2
    } catch (err) {
      console.error('فشل في قراءة ملف الإكسيل:', err)
      errorMessage.value = 'تعذر فك وقراءة ملف الإكسيل، يرجى التأكد من سلامة وصيغة الملف.'
    }
  }
  reader.readAsArrayBuffer(file)
}

function onSheetChange() {
  loadSheetData(selectedSheet.value)
}

function loadSheetData(sheetName) {
  if (!cachedWorkbook || !sheetName) return

  errorMessage.value = null
  const worksheet = cachedWorkbook.Sheets[sheetName]
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

  if (!jsonData || jsonData.length === 0) {
    excelHeaders.value = []
    rawRows.value = []
    errorMessage.value = `ورقة العمل [${sheetName}] فارغة تماماً، يرجى اختيار ورقة أخرى من القائمة المنسدلة أعلاه.`
    return
  }

  excelHeaders.value = Object.keys(jsonData[0])
  rawRows.value = jsonData

  autoDetectMapping()
}

function autoDetectMapping() {
  props.targetFields.forEach((field) => {
    fieldMapping[field.key] = null
  })

  excelHeaders.value.forEach((header) => {
    const cleanHeader = header.trim().toLowerCase()

    props.targetFields.forEach((field) => {
      if (fieldMapping[field.key]) return

      const hasMatch = field.aliases?.some((alias) =>
        cleanHeader.includes(alias.trim().toLowerCase()),
      )

      if (hasMatch) {
        fieldMapping[field.key] = header
      }
    })
  })
}

function getSampleValue(headerName) {
  if (!headerName) return '-'
  for (const row of rawRows.value.slice(0, 5)) {
    if (
      row[headerName] !== undefined &&
      row[headerName] !== null &&
      String(row[headerName]).trim() !== ''
    ) {
      return String(row[headerName]).trim()
    }
  }
  return '-'
}

function validateAndGoToPreview() {
  errorMessage.value = null
  validationList.value = []

  if (rawRows.value.length === 0) {
    errorMessage.value = 'ورقة العمل المختارة فارغة، اختر ورقة عمل تحتوي على بيانات أولاً.'
    return
  }

  const missingRequired = []
  props.targetFields.forEach((field) => {
    if (field.required && !fieldMapping[field.key] && field.defaultValue === undefined) {
      missingRequired.push(field.label)
    }
  })

  if (missingRequired.length > 0) {
    errorMessage.value = 'يجب تعيين وتحديد الأعمدة المقابلة للحقول الإلزامية التالية:'
    validationList.value = missingRequired
    return
  }

  currentStep.value = 3
}

const previewHeaders = computed(() => {
  return props.targetFields
    .filter((f) => fieldMapping[f.key] || f.defaultValue !== undefined)
    .map((f) => ({
      key: f.key,
      label: f.label,
    }))
})

const previewRows = computed(() => {
  return rawRows.value.slice(0, 5).map((row, index) => {
    const transformed = { id: index }
    props.targetFields.forEach((field) => {
      const mappedHeader = fieldMapping[field.key]
      const val = mappedHeader ? row[mappedHeader] : null

      if (val !== undefined && val !== null && String(val).trim() !== '') {
        transformed[field.key] = val
      } else if (field.defaultValue !== undefined) {
        transformed[field.key] = `${field.defaultValue} (تلقائي)`
      } else {
        transformed[field.key] = '-'
      }
    })
    return transformed
  })
})

async function handleFinalSubmit() {
  errorMessage.value = null
  validationList.value = []
  isSubmitting.value = true

  try {
    const payload = rawRows.value.map((row) => {
      const item = {}
      props.targetFields.forEach((field) => {
        const mappedHeader = fieldMapping[field.key]
        const val = mappedHeader ? row[mappedHeader] : null

        if (val !== undefined && val !== null && String(val).trim() !== '') {
          item[field.key] = val
        } else if (field.defaultValue !== undefined) {
          item[field.key] = field.defaultValue
        } else {
          item[field.key] = null
        }
      })
      return item
    })

    const response = await props.submitHandler(payload)
    emit('success', response)
    closeModal()
  } catch (err) {
    if (err.response?.status === 422 && err.response?.data?.errors) {
      errorMessage.value = err.response.data.message || 'خطأ في التحقق من البيانات المستوردة.'
      validationList.value = Object.values(err.response.data.errors).flat()
    } else {
      errorMessage.value =
        err.response?.data?.message || 'فشلت عملية الاستيراد. يرجى مراجعة الخادم وصحة البيانات.'
    }
  } finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  currentStep.value = 1
  availableSheets.value = []
  selectedSheet.value = ''
  cachedWorkbook = null
  excelHeaders.value = []
  rawRows.value = []
  errorMessage.value = null
  validationList.value = []
  emit('update:modelValue', false)
}
</script>
