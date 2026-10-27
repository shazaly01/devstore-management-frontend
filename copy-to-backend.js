import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sourceDir = path.resolve(__dirname, 'dist')
const targetDir = 'C:\\wamp64\\www\\devstore-management-backend\\public'

// 1. التحقق من وجود مجلد dist ومجلد public للباك إند
if (!fs.existsSync(sourceDir)) {
  console.error('❌ خطأ: مجلد dist غير موجود! يجب تشغيل أمر البناء أولاً.')
  process.exit(1)
}

if (!fs.existsSync(targetDir)) {
  console.error(`❌ خطأ: لم يتم العثور على مجلد لارافيل: ${targetDir}`)
  process.exit(1)
}

// 2. تنظيف مخرجات الواجهة القديمة فقط من مجلد public
const targetAssets = path.join(targetDir, 'assets')
const targetIndex = path.join(targetDir, 'index.html')

if (fs.existsSync(targetAssets)) {
  fs.rmSync(targetAssets, { recursive: true, force: true })
}

if (fs.existsSync(targetIndex)) {
  fs.rmSync(targetIndex, { force: true })
}

// 3. نسخ ملفات dist الجديدة مع حماية ملفات لارافيل الأساسية
fs.cpSync(sourceDir, targetDir, {
  recursive: true,
  filter: (src) => {
    const filename = path.basename(src)
    const protectedLaravelFiles = ['index.php', '.htaccess', 'storage', 'web.config', 'robots.txt']
    return !protectedLaravelFiles.includes(filename)
  },
})

console.log(
  '✅ تم البناء والنقل بنجاح إلى مجلد public في Laravel مع الحفاظ على ملفات النظام الأساسية.',
)
