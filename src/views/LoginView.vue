<!-- src/views/auth/LoginView.vue -->
<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-surface-ground flex items-center justify-center p-4 font-sans select-none"
    dir="rtl"
  >
    <!-- 1. خلفية الأورورا المتحركة (متوافقة 100% مع الهوية البرتقالية ومتغيرات النظام) -->
    <div class="aurora-container pointer-events-none">
      <div class="aurora-shape shape1"></div>
      <div class="aurora-shape shape2"></div>
      <div class="aurora-shape shape3"></div>
    </div>

    <!-- طبقة العلامة المائية للشعار -->
    <div class="watermark-overlay"></div>

    <!-- 2. بطاقة تسجيل الدخول الزجاجية الفاخرة -->
    <div
      ref="card"
      @mousemove="onMouseMove"
      class="glass-card w-full max-w-md relative z-10 border border-surface-border shadow-2xl rounded-2xl p-8 backdrop-blur-xl bg-surface-section/80 transition-all duration-300"
    >
      <!-- تأثير اللمعان التفاعلي بنبض برتقالي دافئ -->
      <div class="card-glare"></div>

      <!-- المحتوى الفعلي للبطاقة -->
      <div class="relative z-10">
        <!-- الترويسة والشعار -->
        <div class="text-center mb-8">
          <img :src="logoUrl" alt="Project Logo" class="logo-main mx-auto mb-4" />
          <h1 class="text-3xl font-black text-text-primary tracking-tight">باندا للحسابات</h1>
          <p class="text-xs text-text-muted mt-1.5 font-medium">
            منظومة إدارة المبيعات والمخازن والرقابة المحاسبية
          </p>
        </div>

        <!-- رسالة الخطأ الموحدة دلالياً -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3 text-center bg-danger/10 text-danger border border-danger/30 rounded-xl text-xs font-bold shadow-sm animate-fade-in"
        >
          {{ errorMessage }}
        </div>

        <!-- نموذج تسجيل الدخول -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- حقل اسم المستخدم -->
          <div class="flex flex-col space-y-1 text-right">
            <label class="text-[11px] font-bold text-text-secondary pr-1">اسم المستخدم</label>
            <div
              class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-xl flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
            >
              <span class="absolute right-3.5 text-text-muted pointer-events-none z-10">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
              </span>
              <input
                type="text"
                v-model="credentials.username"
                placeholder="أدخل اسم المستخدم..."
                required
                class="block w-full h-full pr-11 pl-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-bold"
              />
            </div>
          </div>

          <!-- حقل كلمة المرور -->
          <div class="flex flex-col space-y-1 text-right">
            <label class="text-[11px] font-bold text-text-secondary pr-1">كلمة المرور</label>
            <div
              class="relative w-full h-11 bg-surface-ground border border-surface-border rounded-xl flex items-center transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm"
            >
              <span class="absolute right-3.5 text-text-muted pointer-events-none z-10">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </span>
              <input
                type="password"
                v-model="credentials.password"
                placeholder="••••••••"
                required
                class="block w-full h-full pr-11 pl-4 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-bold font-mono tracking-widest"
              />
            </div>
          </div>

          <!-- زر تسجيل الدخول بهوية النظام الموحدة -->
          <div class="pt-2">
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full h-11 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg
                v-if="isLoading"
                class="animate-spin h-5 w-5 text-white"
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
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span v-else>تسجيل الدخول</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const card = ref(null)

const onMouseMove = (event) => {
  if (!card.value) return
  const rect = card.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  card.value.style.setProperty('--mouse-x', `${x}px`)
  card.value.style.setProperty('--mouse-y', `${y}px`)
}

const logoUrl = '/PandaRep.png'
const authStore = useAuthStore()
const router = useRouter()
const credentials = reactive({ username: '', password: '' })
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''
  try {
    await authStore.login(credentials)
    router.push(authStore.returnUrl || '/app/dashboard')
  } catch (error) {
    if (error.response && error.response.status === 401) {
      errorMessage.value = 'اسم المستخدم أو كلمة المرور غير صحيحة.'
    } else {
      errorMessage.value = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* حصر الأنماط محلياً لمنع تسربها لباقي النظام */

.aurora-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  filter: blur(120px) saturate(1.4);
  transform: scale(1.3);
}

.aurora-shape {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: multiply;
}

:global(.dark) .aurora-shape {
  mix-blend-mode: screen;
}

/* استخدام درجات البرتقالي والكهرماني المركزية في هالات الأورورا */
.shape1 {
  width: 600px;
  height: 600px;
  background-color: rgba(var(--color-primary), 0.18);
  top: -150px;
  left: -200px;
  animation: move 25s infinite alternate ease-in-out;
}

.shape2 {
  width: 550px;
  height: 550px;
  background-color: rgba(var(--color-warning), 0.15);
  bottom: -100px;
  right: -150px;
  animation: move 30s infinite alternate-reverse ease-in-out;
}

.shape3 {
  width: 500px;
  height: 500px;
  background-color: rgba(var(--color-primary-dark), 0.12);
  bottom: 50px;
  left: 20%;
  animation: move 22s infinite alternate ease-in-out;
}

@keyframes move {
  from {
    transform: translate(0, 0) rotate(0deg);
  }
  to {
    transform: translate(120px, 70px) rotate(180deg);
  }
}

.card-glare {
  position: absolute;
  left: var(--mouse-x, -100%);
  top: var(--mouse-y, -100%);
  transform: translate(-50%, -50%);
  width: 450px;
  height: 450px;
  background: radial-gradient(
    circle,
    rgba(var(--color-primary), 0.15) 0%,
    rgba(var(--color-primary), 0) 65%
  );
  pointer-events: none;
  transition:
    left 0.1s ease,
    top 0.1s ease;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  opacity: 0.04;
  background-image: url('/PandaRep.png');
  background-repeat: repeat;
  background-size: 260px;
  transform: rotate(-15deg) scale(1.1);
}

.logo-main {
  width: 140px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px 4px 10px rgba(0, 0, 0, 0.15));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
