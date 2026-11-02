// src/config/navigation.js
import {
  HomeIcon,
  Squares2X2Icon,
  BanknotesIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  ReceiptRefundIcon,
  AdjustmentsHorizontalIcon,
  ScissorsIcon,
} from '@heroicons/vue/24/outline'

/**
 * إعدادات القائمة الجانبية للنظام
 * - تم تقسيم القائمة إلى فئات هيكلية واضحة (Headers)
 * - إسناد خاصية theme لكل مجموعة للفرز البصري الدلالي
 */
export const navigationConfig = [
  // ==========================================================================
  // الكتلة الأولى: العمليات والمدخلات اليومية (Daily Operations)
  // ==========================================================================
  {
    type: 'header',
    name: 'العمليات والمدخلات اليومية',
  },
  {
    name: 'لوحة التحكم',
    routeName: 'Dashboard',
    icon: HomeIcon,
    permission: 'dashboard.view',
    theme: 'primary',
  },
  {
    name: 'فواتير المبيعات',
    routeName: 'SalesList',
    icon: ShoppingCartIcon,
    permission: 'sale.view',
    theme: 'primary',
  },
  {
    name: 'فواتير المشتريات',
    routeName: 'PurchasesList',
    icon: ShoppingBagIcon,
    permission: 'purchase.view',
    theme: 'primary',
  },
  {
    name: 'أذونات التفكيك والتجزئة',
    routeName: 'DisassemblyList',
    icon: ScissorsIcon,
    permission: 'disassembly.view',
    theme: 'primary',
  },
  {
    name: 'سندات الصرف',
    routeName: 'PaymentVouchersList',
    icon: ReceiptRefundIcon,
    permission: 'voucher.view',
    theme: 'primary',
  },
  {
    name: 'سندات القبض',
    routeName: 'ReceiptVouchersList',
    icon: ReceiptRefundIcon,
    permission: 'voucher.view',
    theme: 'primary',
  },
  {
    name: 'التسويات الجردية',
    routeName: 'StockAdjustmentsList',
    icon: AdjustmentsHorizontalIcon,
    permission: 'stock_adjustment.view',
    theme: 'primary',
  },
  {
    name: 'كشف الحساب المساعد',
    routeName: 'SubLedgerReport',
    icon: DocumentTextIcon,
    permission: 'report.sub_ledger',
    theme: 'primary',
  },

  // ==========================================================================
  // الكتلة الثانية: التهيئة والبيانات الأساسية (Master Data)
  // ==========================================================================
  {
    type: 'header',
    name: 'التهيئة والمحاسبة',
  },
  {
    name: 'البيانات الأساسية',
    icon: Squares2X2Icon,
    permission: 'item.view',
    theme: 'sky',
    children: [
      {
        name: 'مجموعات الأصناف',
        routeName: 'CategoriesList',
        permission: 'category.view',
      },
      {
        name: 'وحدات القياس',
        routeName: 'UnitsList',
        permission: 'unit.view',
      },
      {
        name: 'المخازن والمستودعات',
        routeName: 'StoresList',
        permission: 'store.view',
      },
      {
        name: 'العملة وسياسات التسعير',
        routeName: 'PricingView',
        permission: 'pricing.view',
      },
      {
        name: 'دليل الأصناف والخدمات',
        routeName: 'ItemsList',
        permission: 'item.view',
      },
      {
        name: 'إدارة العملاء',
        routeName: 'CustomersList',
        permission: 'customer.view',
      },
      {
        name: 'إدارة الموردين',
        routeName: 'SuppliersList',
        permission: 'supplier.view',
      },
    ],
  },
  {
    name: 'المالية والمحاسبة',
    icon: BanknotesIcon,
    permission: 'account.view',
    theme: 'emerald',
    children: [
      {
        name: 'الخزائن المالية',
        routeName: 'TreasuriesList',
        permission: 'treasury.view',
      },
      {
        name: 'الحسابات البنكية',
        routeName: 'BanksList',
        permission: 'bank.view',
      },
      {
        name: 'بنود المصروفات',
        routeName: 'ExpensesList',
        permission: 'expense.view',
      },
    ],
  },

  // ==========================================================================
  // الكتلة الثالثة: التقارير والرقابة (Reports & BI)
  // ==========================================================================
  {
    type: 'header',
    name: 'المخرجات والتقارير',
  },
  {
    name: 'قسم التقارير',
    icon: DocumentChartBarIcon,
    permission: 'report.view',
    theme: 'indigo',
    children: [
      {
        type: 'header',
        name: 'تقارير المخازن والمستودعات',
      },
      {
        name: 'تقرير المخزون الحالي',
        routeName: 'CurrentStockReport',
        permission: 'report.inventory',
      },
      {
        name: 'تقرير كارت الصنف',
        routeName: 'StockCardReport',
        permission: 'report.inventory',
      },
      {
        name: 'تقرير تقييم المخزون',
        routeName: 'StockValuationReport',
        permission: 'report.inventory',
      },
      {
        name: 'ملخص التسويات الجردية',
        routeName: 'AdjustmentsSummaryReport',
        permission: 'report.inventory',
      },
      {
        type: 'header',
        name: 'التقارير المالية والختامية',
      },
      {
        name: 'ميزان المراجعة',
        routeName: 'TrialBalanceReport',
        permission: 'report.financial',
      },
      {
        name: 'قائمة الدخل الختامية',
        routeName: 'IncomeStatementReport',
        permission: 'report.financial',
      },
      {
        name: 'الميزانية العمومية',
        routeName: 'BalanceSheetReport',
        permission: 'report.financial',
      },
    ],
  },

  // ==========================================================================
  // الكتلة الرابعة: الإدارة العامة والنظام (Administration)
  // ==========================================================================
  {
    type: 'header',
    name: 'إدارة النظام',
  },
  {
    name: 'الإدارة العامة',
    icon: Cog6ToothIcon,
    permission: 'user.view',
    theme: 'slate',
    children: [
      {
        name: 'إدارة المستخدمين',
        routeName: 'UsersList',
        permission: 'user.view',
      },
      {
        name: 'الأدوار والصلاحيات',
        routeName: 'RolesList',
        permission: 'role.view',
      },
      {
        name: 'النسخ الاحتياطي للبيانات',
        routeName: 'BackupsList',
        permission: 'backup.view',
      },
    ],
  },
]
