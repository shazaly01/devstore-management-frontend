<!--src/views/sales/components/SaleHeader.vue-->
<template>
  <div
    class="bg-surface-header/60 rounded-xl border border-surface-border border-t-4 border-t-primary shadow-xs text-right font-sans transition-all duration-200"
    :class="isHeaderCollapsed ? 'px-3 py-2' : 'p-3 space-y-2.5'"
    dir="rtl"
  >
    <!-- 1. وضع الطي المدمج: شريط ملخص ذكي يعرض القيم النشطة بنظرة خاطفة -->
    <div
      v-if="isHeaderCollapsed"
      @click="toggleHeaderCollapse"
      class="flex flex-wrap items-center justify-between gap-2 cursor-pointer select-none group"
      title="انقر لتوسيع وتعديل بيانات رأس الفاتورة"
    >
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- شارة نوع الفاتورة (في حال المردود تبرز بوضوح) -->
        <span
          v-if="formData.invoice_type === 'return'"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold bg-warning/15 border-warning/40 text-warning shadow-2xs"
        >
          <span>مردودات مبيعات</span>
          <span v-if="formData.parent_id" class="font-mono">#{{ formData.parent_id }}</span>
        </span>

        <!-- شارة المخزن -->
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs transition-colors"
          :class="
            selectedStoreName
              ? 'bg-surface-card border-surface-border text-text-primary'
              : 'bg-danger/10 border-danger/30 text-danger'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>{{ selectedStoreName || 'المخزن غير محدد' }}</span>
        </span>

        <!-- شارة العميل -->
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs transition-colors"
          :class="
            selectedCustomerName
              ? 'bg-surface-card border-surface-border text-text-primary'
              : 'bg-danger/10 border-danger/30 text-danger'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>{{ selectedCustomerName || 'العميل غير محدد' }}</span>
          <span v-if="formData.customer_name_text" class="text-text-secondary font-medium">
            ({{ formData.customer_name_text }})
          </span>
          <span
            v-if="selectedCustomerPriceListName"
            class="text-[10px] px-1.5 py-0.2 bg-success/15 text-success rounded font-bold"
          >
            {{ selectedCustomerPriceListName }}
          </span>
        </span>

        <!-- شارة وجهة التحصيل (البنك / الخزينة / مقسّم / آجل) -->
        <span
          v-if="showBankSelector && !showTreasurySelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs"
          :class="
            selectedBankName
              ? 'bg-surface-card border-primary/35 text-text-primary'
              : 'bg-warning/15 border-warning/40 text-warning'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
            />
          </svg>
          <span>{{ selectedBankName || 'اختر الحساب البنكي' }}</span>
        </span>

        <span
          v-else-if="showTreasurySelector && !showBankSelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold shadow-2xs"
          :class="
            selectedTreasuryName
              ? 'bg-surface-card border-primary/35 text-text-primary'
              : 'bg-warning/15 border-warning/40 text-warning'
          "
        >
          <svg
            class="w-3.5 h-3.5 text-primary shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>{{ selectedTreasuryName || 'اختر الخزينة النقدية' }}</span>
        </span>

        <span
          v-else-if="showTreasurySelector && showBankSelector"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card border border-primary/35 text-text-primary text-[11px] font-bold shadow-2xs"
        >
          <span class="w-2 h-2 rounded-full bg-primary"></span>
          <span>
            مقسّم: {{ selectedTreasuryName || 'خزينة' }} + {{ selectedBankName || 'بنك' }}
          </span>
        </span>

        <span
          v-else
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-card/70 border border-dashed border-surface-border text-text-muted text-[11px] font-bold"
        >
          <span>{{
            formData.invoice_type === 'return' ? 'مردود آجل على العميل' : 'دفع آجل على العميل'
          }}</span>
        </span>

        <!-- شارة التاريخ -->
        <span
          class="hidden md:inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-surface-card/75 border border-surface-border/70 text-text-secondary text-[11px] font-mono font-bold"
        >
          <span>{{ formData.invoice_date }}</span>
        </span>
      </div>

      <!-- زر التوسيع -->
      <button
        type="button"
        @click.stop="toggleHeaderCollapse"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-card group-hover:bg-primary group-hover:text-white border border-surface-border group-hover:border-primary text-text-secondary text-[11px] font-bold transition-colors shadow-2xs cursor-pointer shrink-0"
      >
        <span>تعديل الرأس</span>
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
    </div>

    <!-- 2. وضع التوسيع الكامل: حقول الترويسة المعتادة مع زر الطي -->
    <template v-else>
      <!-- شريط علوي رفيع لطي الترويسة -->
      <div class="flex items-center justify-between pb-1 border-b border-primary/15">
        <span class="text-[11px] font-black text-text-secondary flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
          بيانات الفاتورة والمخزن والعميل والتحصيل
        </span>

        <button
          type="button"
          @click="toggleHeaderCollapse"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-card/80 hover:bg-primary hover:text-white border border-surface-border hover:border-primary text-text-secondary text-[10px] font-bold transition-colors cursor-pointer"
          title="طي بيانات الرأس لتوفير مساحة أكبر للأصناف وحفظ الوضع"
        >
          <span>طي الترويسة</span>
          <svg class="w-3.5 h-3.5 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      <!-- الصف الأول: 4 أعمدة متساوية (نوع الفاتورة + المخزن + التاريخ + الخزينة/البنك) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <!-- 1. نوع الفاتورة -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </span>

            <select
              v-model="formData.invoice_type"
              :disabled="!!formData.parent_id"
              class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="sale" class="bg-surface-section text-text-primary">
                فاتورة مبيعات نشطة
              </option>
              <option value="return" class="bg-surface-section text-text-primary">
                مردودات مبيعات
              </option>
            </select>

            <span
              class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
            >
              ▼
            </span>
          </div>
          <p
            v-if="getFieldError('invoice_type')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('invoice_type') }}
          </p>
        </div>

        <!-- 2. المخزن المستهدف -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </span>
            <div
              class="w-full h-full pr-8 pl-1 flex items-center"
              :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
            >
              <StoresDropdown
                id="sale-store-id"
                v-model="formData.store_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>
          <p v-if="getFieldError('store_id')" class="text-danger text-[10px] font-bold mt-0.5 pr-1">
            {{ getFieldError('store_id') }}
          </p>
        </div>

        <!-- 3. تاريخ الفاتورة -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <input
              type="date"
              v-model="formData.invoice_date"
              class="block w-full h-full pr-3 pl-16 bg-transparent text-text-primary focus:outline-none text-xs font-mono font-bold text-right cursor-pointer"
            />

            <span
              class="absolute left-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none gap-1 text-xs z-10"
            >
              <span class="font-medium text-[10px]">تاريخ</span>
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>
          <p
            v-if="getFieldError('invoice_date')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('invoice_date') }}
          </p>
        </div>

        <!-- 4. حسابات القبض التلقائية (الخزينة والبنك) -->
        <div class="relative w-full">
          <!-- الخزينة النقدية عند الدفع نقداً -->
          <div
            v-if="showTreasurySelector && !showBankSelector"
            class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <TreasuriesDropdown
                id="sale-treasury-id"
                v-model="formData.treasury_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- الحساب البنكي عند الدفع البنكي -->
          <div
            v-else-if="showBankSelector && !showTreasurySelector"
            class="relative w-full h-9 bg-surface-card border border-primary/50 focus-within:border-primary rounded-lg flex items-center shadow-2xs transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                />
              </svg>
            </span>
            <div class="w-full h-full pr-8 pl-1 flex items-center">
              <BanksDropdown
                id="sale-bank-id"
                v-model="formData.bank_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- عرض مزدوج عند تقسيم الدفع بين نقد وبنك معاً -->
          <div
            v-else-if="showTreasurySelector && showBankSelector"
            class="grid grid-cols-2 gap-1.5"
          >
            <div
              class="relative h-9 bg-surface-card border border-primary/50 rounded-lg flex items-center overflow-hidden"
              title="الخزينة النقدية"
            >
              <TreasuriesDropdown
                id="sale-split-treasury-id"
                v-model="formData.treasury_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
            <div
              class="relative h-9 bg-surface-card border border-primary/50 rounded-lg flex items-center overflow-hidden"
              title="الحساب البنكي"
            >
              <BanksDropdown
                id="sale-split-bank-id"
                v-model="formData.bank_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <!-- حالة الدفع الآجل الكامل أو المردود الآجل -->
          <div
            v-else
            class="relative w-full h-9 bg-surface-card/60 border border-dashed border-surface-border rounded-lg flex items-center justify-center text-text-muted text-[11px] font-medium select-none px-2 text-center"
          >
            <span v-if="formData.invoice_type === 'return'">مردود آجل (لا يتطلب خزنة)</span>
            <span v-else>دفع آجل على حساب العميل</span>
          </div>

          <p
            v-if="getFieldError('treasury_id') || getFieldError('bank_id')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('treasury_id') || getFieldError('bank_id') }}
          </p>
        </div>
      </div>

      <!-- الصف الثاني: 4 أعمدة متطابقة في التقسيم والتوازي التام مع الصف الأول -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-0.5">
        <!-- طريقة الدفع (تظهر في حالة المردود فقط) -->
        <div v-if="formData.invoice_type === 'return'" class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </span>

            <select
              v-model="formData.payment_type"
              :disabled="!!formData.parent_id"
              class="block w-full h-full pr-8 pl-8 bg-transparent text-text-primary focus:outline-none text-xs font-bold appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="cash" class="bg-surface-section text-text-primary">نقدي (Cash)</option>
              <option value="card" class="bg-surface-section text-text-primary">
                دفع بنكي (Card)
              </option>
              <option value="credit" class="bg-surface-section text-text-primary">
                دفع آجل (Credit)
              </option>
            </select>

            <span
              class="absolute left-3 inset-y-0 flex items-center text-text-muted pointer-events-none text-[9px]"
            >
              ▼
            </span>
          </div>
          <p
            v-if="getFieldError('payment_type')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('payment_type') }}
          </p>
        </div>

        <!-- فحص العميل برقم الهاتف (يوازي تماماً خانة نوع الفاتورة بالأعلى) -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </span>

            <input
              type="text"
              v-model="customerPhone"
              @keydown.enter.prevent="checkCustomerPhone"
              :disabled="!!formData.parent_id"
              placeholder="هاتف العميل (Enter للفحص)..."
              class="block w-full h-full pr-8 pl-14 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              @click="checkCustomerPhone"
              :disabled="isCheckingPhone || !customerPhone.trim() || !!formData.parent_id"
              class="absolute left-1 px-2.5 py-1 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold rounded flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
              title="فحص وجود العميل برقم الهاتف"
            >
              <svg
                v-if="isCheckingPhone"
                class="animate-spin w-3 h-3 text-white"
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
              <span v-else>فحص</span>
            </button>
          </div>
        </div>

        <!-- قائمة اختيار العميل (تمتد على عمودين لتوازي المخزن والتاريخ وتغلق المسافة بتناسق) -->
        <div
          class="relative w-full flex flex-col justify-center"
          :class="formData.invoice_type === 'return' ? '' : 'sm:col-span-2 lg:col-span-2'"
        >
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-primary pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>

            <div
              class="w-full h-full pr-8 pl-1 flex items-center"
              :class="{ 'opacity-60 pointer-events-none cursor-not-allowed': !!formData.parent_id }"
            >
              <CustomersDropdown
                id="sale-customer-id"
                v-model="formData.customer_id"
                label=""
                variant="sales"
                class="w-full bg-transparent header-embedded-dropdown"
              />
            </div>
          </div>

          <div
            v-if="selectedCustomerPriceListName"
            class="mt-1 flex items-center gap-1 animate-fade-in pr-1"
          >
            <span class="inline-block w-1.5 h-1.5 bg-success rounded-full"></span>
            <span class="text-[10px] text-success font-bold">
              فئة السعر: {{ selectedCustomerPriceListName }}
            </span>
          </div>

          <p
            v-if="getFieldError('customer_id')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('customer_id') }}
          </p>
        </div>

        <!-- اسم العميل النصي (يوازي تماماً خانة البنك والخزينة بالأعلى) -->
        <div class="relative w-full">
          <div
            class="relative w-full h-9 bg-surface-card border border-surface-border rounded-lg flex items-center shadow-2xs transition-all duration-200 hover:border-primary/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          >
            <span
              class="absolute right-2.5 inset-y-0 flex items-center text-text-muted pointer-events-none z-10"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </span>

            <input
              type="text"
              v-model="formData.customer_name_text"
              :readonly="!!formData.parent_id"
              placeholder="اسم العميل (نص حر - اختياري)"
              class="block w-full h-full pr-8 pl-3 bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-xs font-medium readonly:opacity-70"
            />
          </div>
          <p
            v-if="getFieldError('customer_name_text')"
            class="text-danger text-[10px] font-bold mt-0.5 pr-1"
          >
            {{ getFieldError('customer_name_text') }}
          </p>
        </div>
      </div>

      <!-- شريط معلومات المردود في حالة ربط الفاتورة الأم -->
      <div
        v-if="formData.invoice_type === 'return'"
        class="w-full bg-primary/10 border border-dashed border-primary/40 rounded-lg p-2.5 flex items-center justify-between animate-fade-in text-xs"
      >
        <div class="flex items-center gap-2">
          <span class="text-primary font-bold">مردود مرتبط بالفاتورة الأصلية:</span>
          <span class="font-mono font-black text-white bg-primary px-2 py-0.5 rounded text-[11px]">
            #{{ formData.parent_id }}
          </span>
        </div>
        <p v-if="getFieldError('parent_id')" class="text-danger text-[10px] font-bold pr-1">
          {{ getFieldError('parent_id') }}
        </p>
      </div>
    </template>

    <!-- نافذة إضافة عميل جديد السريعة -->
    <CustomerModal
      v-if="isCustomerModalOpen"
      v-model="isCustomerModalOpen"
      :customer="newCustomerInitialData"
      :is-saving="isSavingCustomer"
      @save="handleSaveNewCustomer"
    />
  </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue'
import { useCustomerStore } from '@/stores/customerStore'
import { useSaleStore } from '@/stores/saleStore'
import { useStoreStore } from '@/stores/storeStore'
import { useTreasuryStore } from '@/stores/treasuryStore'
import { useBankStore } from '@/stores/bankStore'
import { useToast } from 'vue-toastification'
import StoresDropdown from '@/components/forms/StoresDropdown.vue'
import TreasuriesDropdown from '@/components/forms/TreasuriesDropdown.vue'
import BanksDropdown from '@/components/forms/BanksDropdown.vue'
import CustomersDropdown from '@/components/forms/CustomersDropdown.vue'
import CustomerModal from '@/views/customers/CustomerModal.vue'

const formData = defineModel({ type: Object, required: true })

const props = defineProps({
  validationErrors: { type: Object, default: () => null },
  isPos: { type: Boolean, default: false },
})

const customerStore = useCustomerStore()
const saleStore = useSaleStore()
const storeStore = useStoreStore()
const treasuryStore = useTreasuryStore()
const bankStore = useBankStore()
const toast = useToast()

// إدارة طي الترويسة وحفظ الحالة في المتصفح حسب الوضع (POS / قياسية)
const storageKey = computed(() =>
  props.isPos ? 'panda_pos_header_collapsed' : 'panda_standard_header_collapsed',
)

const isHeaderCollapsed = ref(false)

const loadCollapsedPreference = () => {
  try {
    const saved = localStorage.getItem(storageKey.value)
    if (saved !== null) {
      isHeaderCollapsed.value = saved === 'true'
    }
  } catch (error) {
    console.warn('تعذر قراءة حالة طي الترويسة من المتصفح:', error)
  }
}

const toggleHeaderCollapse = () => {
  isHeaderCollapsed.value = !isHeaderCollapsed.value
  try {
    localStorage.setItem(storageKey.value, String(isHeaderCollapsed.value))
  } catch (error) {
    console.warn('تعذر حفظ حالة طي الترويسة في المتصفح:', error)
  }
}

watch(storageKey, () => {
  loadCollapsedPreference()
})

// الفتح التلقائي للترويسة إذا ظهرت أخطاء تحقق في أي حقل من حقول الرأس
watch(
  () => props.validationErrors,
  (errors) => {
    if (!errors) return
    const headerErrorKeys = [
      'invoice_type',
      'store_id',
      'invoice_date',
      'payment_type',
      'treasury_id',
      'bank_id',
      'customer_id',
      'customer_name_text',
      'parent_id',
      'cash_amount',
      'bank_amount',
    ]
    const hasHeaderError = headerErrorKeys.some(
      (key) => Array.isArray(errors[key]) && errors[key].length > 0,
    )
    if (hasHeaderError) {
      isHeaderCollapsed.value = false
    }
  },
  { deep: true },
)

const showTreasurySelector = computed(() => {
  if (formData.value.invoice_type === 'return') {
    return formData.value.payment_type === 'cash'
  }
  return Number(formData.value.cash_amount ?? 0) > 0
})

const showBankSelector = computed(() => {
  if (formData.value.invoice_type === 'return') {
    return formData.value.payment_type === 'card'
  }
  return Number(formData.value.bank_amount ?? 0) > 0
})

const selectedStoreName = computed(() => {
  const id = Number(formData.value?.store_id)
  if (!id) return null
  const found = storeStore.stores?.find((s) => Number(s.id) === id)
  return found?.name || `المخزن #${id}`
})

const selectedCustomerName = computed(() => {
  const id = Number(formData.value?.customer_id)
  if (!id) return null
  const found = customerStore.customers?.find((c) => Number(c.id) === id)
  return found?.name || `عميل #${id}`
})

const selectedTreasuryName = computed(() => {
  const id = Number(formData.value?.treasury_id)
  if (!id) return null
  const found = treasuryStore.treasuries?.find((t) => Number(t.id) === id)
  return found?.name || `خزينة #${id}`
})

const selectedBankName = computed(() => {
  const id = Number(formData.value?.bank_id)
  if (!id) return null
  const found = bankStore.banks?.find((b) => Number(b.id) === id)
  return found?.name || `بنك #${id}`
})

const originalSales = ref([])
const customerPhone = ref('')
const isCheckingPhone = ref(false)
const isCustomerModalOpen = ref(false)
const newCustomerInitialData = ref(null)
const isSavingCustomer = ref(false)

const checkCustomerPhone = async () => {
  const phone = customerPhone.value?.trim()
  if (!phone) {
    toast.warning('يرجى إدخال رقم الهاتف أولاً لإجراء الفحص.')
    return
  }

  isCheckingPhone.value = true
  try {
    const matchedCustomer = await customerStore.findByPhone(phone)
    if (matchedCustomer) {
      formData.value.customer_id = matchedCustomer.id
      toast.success(`تم العثور على العميل "${matchedCustomer.name}" واختياره للفاتورة.`)
    } else {
      toast.info('العميل غير مسجل، تم فتح نافذة تسجيل عميل جديد.')
      newCustomerInitialData.value = {
        name: '',
        phone: phone,
        email: '',
        credit_limit: '',
        opening_balance: '',
        price_list_id: null,
      }
      isCustomerModalOpen.value = true
    }
  } catch (error) {
    console.error('خطأ أثناء فحص رقم هاتف العميل:', error)
    toast.error('تعذر استكمال فحص رقم الهاتف، حاول مرة أخرى.')
  } finally {
    isCheckingPhone.value = false
  }
}

const handleSaveNewCustomer = async (customerData) => {
  isSavingCustomer.value = true
  try {
    const response = await customerStore.createCustomer(customerData)
    const createdCustomer = response?.data || response

    if (createdCustomer && createdCustomer.id) {
      formData.value.customer_id = createdCustomer.id
      customerPhone.value = createdCustomer.phone || customerPhone.value
      toast.success(`تم تسجيل العميل "${createdCustomer.name}" بنجاح وتعيينه للفاتورة.`)
    }

    isCustomerModalOpen.value = false
  } catch (error) {
    const errorMsg =
      customerStore.error || error.response?.data?.message || 'فشل في تسجيل بيانات العميل الجديد.'
    toast.error(errorMsg)
  } finally {
    isSavingCustomer.value = false
  }
}

watch(
  () => formData.value.customer_id,
  (newId) => {
    if (newId && customerStore.customers) {
      const currentCust = customerStore.customers.find((c) => c.id === newId)
      if (currentCust && currentCust.phone && !customerPhone.value) {
        customerPhone.value = currentCust.phone
      }
    }
  },
)

const selectedCustomerPriceListName = computed(() => {
  if (!formData.value.customer_id || !customerStore.customers) return null
  const currentCust = customerStore.customers.find((c) => c.id === formData.value.customer_id)
  return (
    currentCust?.price_list?.name ||
    (currentCust?.price_list_id ? `فئة #${currentCust.price_list_id}` : null)
  )
})

const loadOriginalSales = async () => {
  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    try {
      await saleStore.fetchSales(1, {
        customer_id: formData.value.customer_id,
        invoice_type: 'sale',
      })
      originalSales.value = saleStore.sales
    } catch (error) {
      console.error('فشل جلب فواتير المبيعات المتاحة للمردود:', error)
      originalSales.value = []
    }
  } else {
    originalSales.value = []
    if (!formData.value.parent_id) {
      formData.value.parent_id = null
    }
  }
}

watch(
  () => [formData.value.invoice_type, formData.value.customer_id],
  async () => {
    await loadOriginalSales()
  },
)

const getFieldError = (path) => {
  if (!props.validationErrors) return null
  return props.validationErrors[path]?.[0] || null
}

onMounted(async () => {
  loadCollapsedPreference()

  const preloadTasks = []
  if (customerStore.customers.length === 0) {
    preloadTasks.push(customerStore.fetchCustomers(1, { is_active: 1 }))
  }
  if (storeStore.stores.length === 0) {
    preloadTasks.push(storeStore.fetchStores(1, { per_page: 1000 }))
  }
  if (treasuryStore.treasuries.length === 0) {
    preloadTasks.push(treasuryStore.fetchTreasuries(1, { per_page: 1000 }))
  }
  if (bankStore.banks.length === 0) {
    preloadTasks.push(bankStore.fetchBanks(1, { per_page: 1000 }))
  }

  if (preloadTasks.length > 0) {
    await Promise.allSettled(preloadTasks)
  }

  if (formData.value.customer_name_text === undefined) {
    formData.value.customer_name_text = null
  }

  if (formData.value.invoice_type === 'return' && formData.value.customer_id) {
    await loadOriginalSales()
  }
})
</script>

<style scoped>
:global(.dark input[type='date']::-webkit-calendar-picker-indicator) {
  filter: invert(1);
}

input[type='date']::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

:deep(.header-embedded-dropdown .p-dropdown),
:deep(.header-embedded-dropdown [data-pc-name='dropdown']),
:deep(.header-embedded-dropdown [data-pc-section='root']),
:deep(.header-embedded-dropdown div.inline-flex) {
  background: transparent !important;
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
  outline: none !important;
  height: 36px !important;
  min-height: 36px !important;
}

:deep(.header-embedded-dropdown .p-dropdown-label),
:deep(.header-embedded-dropdown [data-pc-section='input']) {
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  padding: 0 0.25rem !important;
  display: flex !important;
  align-items: center !important;
}

.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(3px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
