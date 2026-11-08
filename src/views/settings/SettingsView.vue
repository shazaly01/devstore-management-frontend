<!-- src/views/settings/SettingsView.vue -->
<template>
  <div class="space-y-4 font-sans text-right" dir="rtl">
    <!-- 1. شريط العنوان والأزرار وإدارة الحالة (Sticky Header) -->
    <div
      class="p-4 bg-surface-header/80 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors duration-200"
    >
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-primary/10 text-primary rounded-lg">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-black text-text-primary">إعدادات النظام العامة</h1>
            <p class="text-[11px] text-text-muted">
              تخصيص بيانات المنشأة، سلوك البيع في الكاشير، وخيارات طباعة الفواتير.
            </p>
          </div>
        </div>
      </div>

      <!-- أزرار الإجراءات وشارة التغييرات -->
      <div class="flex items-center gap-2 self-end sm:self-auto">
        <span
          v-if="isDirty"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-warning/15 text-warning border border-warning/30 rounded-lg text-[10px] font-bold animate-pulse"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-warning"></span>
          تغييرات غير محفوظة
        </span>

        <button
          type="button"
          @click="resetForm"
          :disabled="!isDirty || settingStore.saving"
          class="h-9 px-3 bg-surface-card hover:bg-surface-ground text-text-secondary border border-surface-border text-xs font-bold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span>تراجع</span>
        </button>

        <button
          type="button"
          @click="saveSettings"
          :disabled="!isDirty || settingStore.saving"
          class="h-9 px-4 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <svg
            v-if="settingStore.saving"
            class="animate-spin w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>{{ settingStore.saving ? 'جارٍ الحفظ...' : 'حفظ التعديلات' }}</span>
        </button>
      </div>
    </div>

    <!-- 2. حالة التحميل الأولي (Skeleton Loader) -->
    <div
      v-if="settingStore.loading && availableTabs.length === 0"
      class="p-8 bg-surface-section rounded-xl border border-surface-border text-center space-y-3"
    >
      <div
        class="inline-block animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
      ></div>
      <p class="text-xs font-bold text-text-muted">جارٍ تحميل إعدادات النظام...</p>
    </div>

    <!-- 3. المحتوى الرئيسي عند اكتمال التحميل -->
    <div v-else class="space-y-4">
      <!-- شريط التبويبات الأفقية (Tabs Segmented Bar) -->
      <div
        class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-surface-border/70 scrollbar-none"
      >
        <button
          v-for="tab in availableTabs"
          :key="tab.key"
          type="button"
          @click="activeTab = tab.key"
          class="h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer"
          :class="
            activeTab === tab.key
              ? 'bg-primary text-white shadow-sm'
              : 'bg-surface-card hover:bg-surface-header/60 text-text-secondary border border-surface-border'
          "
        >
          <span>{{ tab.label }}</span>
          <span
            class="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
            :class="
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-surface-ground text-text-muted'
            "
          >
            {{ currentTabItems(tab.key).length }}
          </span>
        </button>
      </div>

      <!-- بطاقات الحقول للتبويب النشط -->
      <div
        class="p-4 bg-surface-section rounded-xl border border-surface-border shadow-xs space-y-4"
      >
        <div class="border-b border-surface-border pb-2.5">
          <h2 class="text-xs font-extrabold text-text-primary">
            {{ activeTabMeta?.label || activeTab }}
          </h2>
          <p class="text-[11px] text-text-muted mt-0.5">
            {{ activeTabMeta?.description || 'قائمة الإعدادات التابعة لهذا القسم.' }}
          </p>
        </div>

        <!-- شبكة الحقول المولدة ديناميكياً -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="setting in currentTabItems(activeTab)"
            :key="setting.key"
            :class="{
              'md:col-span-2':
                setting.type === 'json' ||
                setting.type === 'array' ||
                setting.key.includes('footer') ||
                setting.key.includes('address'),
            }"
          >
            <SettingFieldRenderer
              :setting="setting"
              v-model="localValues[setting.key]"
              :error="getFieldError(setting.key)"
            />
          </div>
        </div>

        <div
          v-if="currentTabItems(activeTab).length === 0"
          class="py-8 text-center text-xs font-medium text-text-muted"
        >
          لا توجد إعدادات معرّفة في هذا القسم حالياً.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingStore } from '@/stores/settingStore'
import { useToast } from 'vue-toastification'
import SettingFieldRenderer from './components/SettingFieldRenderer.vue'

const settingStore = useSettingStore()
const toast = useToast()

const activeTab = ref('general')
const localValues = ref({})
const initialValues = ref({})

// بيانات وتسميات المجموعات الثابتة مع دعم أي تبويب ديناميكي يطرأ جديداً
const tabsMetadata = {
  general: {
    label: 'بيانات المنشأة',
    description: 'معلومات الهوية التجارية، العناوين، أرقام الهواتف، والسجل التجاري.',
  },
  pos: {
    label: 'نقطة البيع والكاشير',
    description: 'سياسات حركات البيع، التنبيهات المخزنية، وصلاحيات الخصم اليدوي.',
  },
  printing: {
    label: 'الطباعة وتصميم الفواتير',
    description: 'خيارات ورق الطباعة الحرارية، نصوص الترويسة والتذييل، والبيانات المطبوعة.',
  },
}

// التبويبات المتاحة المحسوبة ديناميكياً من المجموعات الراجعة من قاعدة البيانات
const availableTabs = computed(() => {
  const groupsInDb = Object.keys(settingStore.groupedSettings || {})
  if (groupsInDb.length === 0) {
    return Object.keys(tabsMetadata).map((key) => ({
      key,
      ...tabsMetadata[key],
    }))
  }

  return groupsInDb.map((groupKey) => {
    return {
      key: groupKey,
      label: tabsMetadata[groupKey]?.label || groupKey,
      description: tabsMetadata[groupKey]?.description || `إعدادات ${groupKey}`,
    }
  })
})

const activeTabMeta = computed(() => {
  return availableTabs.value.find((t) => t.key === activeTab.value) || null
})

const currentTabItems = (tabKey) => {
  if (settingStore.groupedSettings && settingStore.groupedSettings[tabKey]) {
    return settingStore.groupedSettings[tabKey]
  }
  return settingStore.settings.filter((s) => s.group === tabKey)
}

// مزامنة البيانات المحلية مع بيانات المتجر
const syncLocalValues = () => {
  const values = {}
  settingStore.settings.forEach((s) => {
    values[s.key] = s.value
  })
  localValues.value = JSON.parse(JSON.stringify(values))
  initialValues.value = JSON.parse(JSON.stringify(values))
}

// فحص وجود تعديلات غير محفوظة
const isDirty = computed(() => {
  return JSON.stringify(localValues.value) !== JSON.stringify(initialValues.value)
})

const resetForm = () => {
  localValues.value = JSON.parse(JSON.stringify(initialValues.value))
  toast.info('تم التراجع عن التعديلات واستعادة القيم الأصلية.')
}

const getFieldError = (key) => {
  if (!settingStore.validationErrors) return null
  return (
    settingStore.validationErrors[`settings.${key}`]?.[0] ||
    settingStore.validationErrors[key]?.[0] ||
    null
  )
}

const saveSettings = async () => {
  try {
    const payload = []
    for (const [key, value] of Object.entries(localValues.value)) {
      payload.push({ key, value })
    }

    const response = await settingStore.updateSettings(payload)
    syncLocalValues()
    toast.success(response.message || 'تم حفظ وتحديث إعدادات النظام بنجاح.')
  } catch (err) {
    console.error('فشل حفظ الإعدادات:', err)
    toast.error(settingStore.error || 'تعذر حفظ الإعدادات، يرجى مراجعة المدخلات.')
  }
}

onMounted(async () => {
  try {
    await settingStore.fetchSettings()
    syncLocalValues()

    // ضبط التبويب الافتراضي
    if (
      availableTabs.value.length > 0 &&
      !availableTabs.value.some((t) => t.key === activeTab.value)
    ) {
      activeTab.value = availableTabs.value[0].key
    }
  } catch (err) {
    console.error('فشل في جلب الإعدادات عند فتح الصفحة:', err)
  }
})
</script>
