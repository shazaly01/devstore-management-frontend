<!--src/components/layout/TheSidebar.vue-->
<template>
  <aside
    class="flex h-full flex-col bg-surface-section border-l border-surface-border lg:border-l-0 lg:border-r transition-colors duration-200"
  >
    <!-- رأس القائمة الجانبية -->
    <div
      class="flex h-16 items-center justify-between px-5 flex-shrink-0 border-b border-surface-border/50"
    >
      <RouterLink :to="{ name: 'Dashboard' }" class="flex items-center gap-2">
        <img :src="logoUrl" alt="Logo" class="h-10 w-auto object-contain" />
        <h1 class="text-xl font-bold text-text-primary">{{ projectName }}</h1>
      </RouterLink>
      <button
        @click="$emit('close-sidebar')"
        class="lg:hidden text-text-muted hover:text-text-primary"
      >
        <XMarkIcon class="h-6 w-6" />
      </button>
    </div>

    <!-- مساحة التمرير والروابط -->
    <div class="flex flex-1 flex-col justify-between overflow-y-auto mt-2">
      <nav class="space-y-1 px-4">
        <template v-for="(item, itemIndex) in filteredNavLinks" :key="item.name || itemIndex">
          <!-- فاصل عنوان رئيسي بين الكتل -->
          <div v-if="item.type === 'header'" class="px-2 pt-4 pb-1.5 select-none">
            <span class="text-[11px] font-bold text-text-muted/70 uppercase tracking-wider block">
              {{ item.name }}
            </span>
          </div>

          <!-- رابط مفرد مباشر (العمليات اليومية ولوحة التحكم) -->
          <RouterLink
            v-else-if="!item.children"
            :to="{ name: item.routeName }"
            class="nav-link group"
            @click="$emit('close-sidebar')"
          >
            <component
              :is="item.icon"
              class="h-5 w-5 transition-transform duration-200 group-hover:scale-110 flex-shrink-0"
              :class="getTheme(item.theme).rootIcon"
              stroke-width="1.5"
            />
            <span class="mx-2.5 text-sm font-medium">{{ item.name }}</span>
          </RouterLink>

          <!-- مجموعة منسدلة (البيانات الأساسية / المالية / التقارير / الإدارة) -->
          <div v-else class="my-0.5">
            <button
              @click="toggleGroup(item.name)"
              class="nav-group-button group"
              :class="[
                isGroupOpen(item.name) ? getTheme(item.theme).groupOpenHeader : '',
                isGroupActive(item) ? getTheme(item.theme).activeGroupHeader : '',
              ]"
            >
              <div class="flex items-center min-w-0">
                <div
                  class="flex h-7 w-7 items-center justify-center rounded-md transition-colors"
                  :class="getTheme(item.theme).iconContainer"
                >
                  <component
                    :is="item.icon"
                    class="h-5 w-5 transition-transform duration-200 group-hover:scale-105 flex-shrink-0"
                    stroke-width="1.5"
                  />
                </div>
                <span class="mx-2.5 text-sm font-semibold truncate">{{ item.name }}</span>
              </div>
              <ChevronDownIcon
                class="h-4 w-4 transform transition-transform duration-200 text-text-muted"
                :class="{ 'rotate-180': isGroupOpen(item.name) }"
              />
            </button>

            <!-- حاوية العناصر الفرعية مع تدرج لوني وحد جانبي مميز للموديول -->
            <transition
              enter-active-class="transition-all ease-in-out duration-300"
              leave-active-class="transition-all ease-in-out duration-200"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-[600px] opacity-100"
              leave-from-class="max-h-[600px] opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <div
                v-show="isGroupOpen(item.name)"
                class="mt-1 mr-2 space-y-1 overflow-hidden rounded-lg py-1.5 px-1.5 transition-colors duration-200"
                :class="getTheme(item.theme).subContainer"
              >
                <template
                  v-for="(child, childIndex) in item.children"
                  :key="child.name || childIndex"
                >
                  <!-- عنوان تصنيف داخلي (مثل فواصل التقارير) -->
                  <div
                    v-if="child.type === 'header'"
                    class="px-3 pt-2.5 pb-1 select-none border-t border-surface-border/50 first:border-t-0 first:pt-1 mt-1.5 first:mt-0"
                  >
                    <span
                      class="text-[10px] font-extrabold uppercase tracking-wider block"
                      :class="getTheme(item.theme).subHeaderColor"
                    >
                      {{ child.name }}
                    </span>
                  </div>

                  <!-- الروابط الفرعية داخل المجموعة المنسدلة -->
                  <RouterLink
                    v-else
                    :to="{ name: child.routeName }"
                    v-slot="{ isExactActive, navigate, href }"
                    custom
                    @click="$emit('close-sidebar')"
                  >
                    <a
                      :href="href"
                      @click="navigate"
                      class="nav-link nav-sub-link group"
                      :class="[
                        isExactActive
                          ? getTheme(item.theme).activeSubLink
                          : 'text-text-secondary hover:bg-surface-ground/70 hover:text-text-primary',
                      ]"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full transition-all duration-200 ml-1 flex-shrink-0"
                        :class="[
                          isExactActive
                            ? getTheme(item.theme).activeDot
                            : 'bg-text-muted/40 group-hover:bg-text-muted',
                        ]"
                      ></span>
                      <span class="mx-2 text-[13px] font-medium leading-none">{{
                        child.name
                      }}</span>
                    </a>
                  </RouterLink>
                </template>
              </div>
            </transition>
          </div>
        </template>
      </nav>

      <!-- فوتر القائمة الجانبية (تسجيل الخروج) -->
      <div class="mt-auto border-t border-surface-border px-3 py-3">
        <a @click.prevent="handleLogout" href="#" class="nav-link text-danger hover:bg-danger/10">
          <ArrowLeftOnRectangleIcon class="h-5 w-5" stroke-width="1.5" />
          <span class="mx-2.5 text-sm font-medium">تسجيل الخروج</span>
        </a>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, shallowRef, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { ArrowLeftOnRectangleIcon, XMarkIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'
import { navigationConfig } from '@/config/navigation'

const logoUrl = '/PandaRep.png'

defineEmits(['close-sidebar'])

const authStore = useAuthStore()
const route = useRoute()

const projectName = ref(import.meta.env.VITE_APP_NAME || 'لوحة تحكم')

const allNavLinks = shallowRef(navigationConfig)

// تعريف سمات التصميم البصرية لكل موديول بصيغة Tailwind كاملة لمنع الـ Purge
const moduleThemes = {
  // العمليات التشغيلية (البرتقالي - هوية النظام)
  primary: {
    rootIcon: 'text-primary',
    iconContainer: 'bg-primary/10 text-primary dark:bg-primary/20',
    groupOpenHeader: 'bg-primary/5 text-primary dark:bg-primary/10',
    activeGroupHeader: 'text-primary font-bold',
    subContainer: 'bg-primary/[0.03] dark:bg-primary/[0.08] border-r-2 border-primary/40',
    subHeaderColor: 'text-primary dark:text-primary-light',
    activeSubLink:
      'bg-primary/15 text-primary dark:bg-primary/25 font-bold border-r-2 border-primary rounded-r-none',
    activeDot: 'bg-primary scale-125',
  },
  // البيانات الأساسية والتهيئة (السماوي الهادئ)
  sky: {
    rootIcon: 'text-sky-500 dark:text-sky-400',
    iconContainer: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
    groupOpenHeader: 'bg-sky-50/70 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    activeGroupHeader: 'text-sky-600 dark:text-sky-400 font-bold',
    subContainer: 'bg-sky-50/40 dark:bg-sky-950/30 border-r-2 border-sky-500/50',
    subHeaderColor: 'text-sky-700 dark:text-sky-300',
    activeSubLink:
      'bg-sky-100/90 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200 font-bold border-r-2 border-sky-500 rounded-r-none',
    activeDot: 'bg-sky-500 scale-125',
  },
  // المالية والمحاسبة (الأخضر الزمردي)
  emerald: {
    rootIcon: 'text-emerald-500 dark:text-emerald-400',
    iconContainer: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    groupOpenHeader:
      'bg-emerald-50/70 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    activeGroupHeader: 'text-emerald-600 dark:text-emerald-400 font-bold',
    subContainer: 'bg-emerald-50/40 dark:bg-emerald-950/30 border-r-2 border-emerald-500/50',
    subHeaderColor: 'text-emerald-700 dark:text-emerald-300',
    activeSubLink:
      'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 font-bold border-r-2 border-emerald-500 rounded-r-none',
    activeDot: 'bg-emerald-500 scale-125',
  },
  // قسم التقارير والمخرجات (النيلي الأنيق)
  indigo: {
    rootIcon: 'text-indigo-500 dark:text-indigo-400',
    iconContainer: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400',
    groupOpenHeader: 'bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    activeGroupHeader: 'text-indigo-600 dark:text-indigo-400 font-bold',
    subContainer: 'bg-indigo-50/40 dark:bg-indigo-950/30 border-r-2 border-indigo-500/50',
    subHeaderColor: 'text-indigo-700 dark:text-indigo-300',
    activeSubLink:
      'bg-indigo-100/90 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200 font-bold border-r-2 border-indigo-500 rounded-r-none',
    activeDot: 'bg-indigo-500 scale-125',
  },
  // الإدارة العامة والنظام (الرمادي المتزن)
  slate: {
    rootIcon: 'text-slate-500 dark:text-slate-400',
    iconContainer: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    groupOpenHeader: 'bg-slate-100/80 text-slate-800 dark:bg-slate-800/50 dark:text-slate-200',
    activeGroupHeader: 'text-slate-700 dark:text-slate-300 font-bold',
    subContainer: 'bg-slate-100/50 dark:bg-slate-800/30 border-r-2 border-slate-500/50',
    subHeaderColor: 'text-slate-600 dark:text-slate-300',
    activeSubLink:
      'bg-slate-200/80 text-slate-900 dark:bg-slate-700/60 dark:text-slate-100 font-bold border-r-2 border-slate-500 rounded-r-none',
    activeDot: 'bg-slate-500 scale-125',
  },
}

const getTheme = (themeName) => {
  return moduleThemes[themeName] || moduleThemes.primary
}

const isGroupActive = (group) => {
  if (!group.children) return false
  return group.children.some((child) => child.routeName === route.name)
}

const filteredNavLinks = computed(() => {
  const filterChildren = (children) => {
    const rawFiltered = children.filter((child) => {
      if (child.type === 'header') return true
      return authStore.can(child.permission)
    })

    const cleanedChildren = []
    for (let i = 0; i < rawFiltered.length; i++) {
      if (rawFiltered[i].type === 'header') {
        let hasValidChildrenAhead = false
        for (let j = i + 1; j < rawFiltered.length; j++) {
          if (rawFiltered[j].type === 'header') break
          hasValidChildrenAhead = true
        }
        if (hasValidChildrenAhead) {
          cleanedChildren.push(rawFiltered[i])
        }
      } else {
        cleanedChildren.push(rawFiltered[i])
      }
    }
    return cleanedChildren
  }

  // فلترة العناصر الجذرية والتحقق من الصلاحيات
  const rawRootItems = allNavLinks.value
    .map((item) => {
      if (item.type === 'header') {
        return item
      }
      if (item.children) {
        if (!authStore.can(item.permission)) return null
        const filteredChildren = filterChildren(item.children)
        if (filteredChildren.length > 0 && filteredChildren.some((c) => c.type !== 'header')) {
          return { ...item, children: filteredChildren }
        }
        return null
      }
      return authStore.can(item.permission) ? item : null
    })
    .filter(Boolean)

  // تنظيف الفواصل العلوية الفارغة
  const cleanedRoot = []
  for (let i = 0; i < rawRootItems.length; i++) {
    if (rawRootItems[i].type === 'header') {
      let hasValidItemsAhead = false
      for (let j = i + 1; j < rawRootItems.length; j++) {
        if (rawRootItems[j].type === 'header') break
        hasValidItemsAhead = true
      }
      if (hasValidItemsAhead) {
        cleanedRoot.push(rawRootItems[i])
      }
    } else {
      cleanedRoot.push(rawRootItems[i])
    }
  }

  return cleanedRoot
})

const openGroups = ref([])

const toggleGroup = (groupName) => {
  if (openGroups.value.includes(groupName)) {
    openGroups.value = openGroups.value.filter((g) => g !== groupName)
  } else {
    openGroups.value.push(groupName)
  }
}

const isGroupOpen = (groupName) => {
  return openGroups.value.includes(groupName)
}

const setActiveGroup = () => {
  const currentRouteName = route.name
  for (const group of filteredNavLinks.value) {
    if (group.children && group.children.some((child) => child.routeName === currentRouteName)) {
      if (!isGroupOpen(group.name)) {
        openGroups.value.push(group.name)
      }
      return
    }
  }
}

watch(route, setActiveGroup, { immediate: true })

const handleLogout = async () => {
  await authStore.logout()
}
</script>

<style scoped>
.nav-link {
  @apply flex items-center rounded-lg px-3 py-2 text-text-secondary transition-all duration-200 select-none;
}
.nav-link:hover {
  @apply bg-surface-ground text-text-primary;
}
.nav-link.router-link-exact-active {
  @apply bg-gradient-to-r from-primary to-primary-dark text-white font-semibold shadow-md shadow-primary/25;
}
.nav-sub-link {
  @apply py-1.5 px-2.5 rounded-md;
}
.nav-group-button {
  @apply flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-text-secondary transition-all duration-200 select-none;
}
.nav-group-button:hover {
  @apply bg-surface-ground text-text-primary;
}
</style>
