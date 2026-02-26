import fs from 'node:fs'
import path from 'node:path'

const baseDir = process.cwd()
const enPath = path.join(baseDir, 'locales/en.json')
const zhPath = path.join(baseDir, 'locales/zh.json')

function loadJson(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(text)
  }
  catch (error) {
    console.error(`Failed to parse JSON: ${filePath}`)
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

function flattenKeys(obj, prefix = '') {
  const keys = new Set()
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj)) {
      const current = prefix ? `${prefix}.${key}` : key
      keys.add(current)
      const childKeys = flattenKeys(value, current)
      for (const childKey of childKeys)
        keys.add(childKey)
    }
  }
  return keys
}

function printDiff(title, diff) {
  console.log(`\n${title}: ${diff.length}`)
  if (diff.length > 0) {
    for (const key of diff)
      console.log(`- ${key}`)
  }
}

const en = loadJson(enPath)
const zh = loadJson(zhPath)

const enKeys = [...flattenKeys(en)].sort()
const zhKeys = [...flattenKeys(zh)].sort()

const enSet = new Set(enKeys)
const zhSet = new Set(zhKeys)

const missingInZh = enKeys.filter(key => !zhSet.has(key))
const missingInEn = zhKeys.filter(key => !enSet.has(key))

console.log('i18n key check result')
console.log('=====================')
console.log(`en keys: ${enKeys.length}`)
console.log(`zh keys: ${zhKeys.length}`)
printDiff('Missing in zh', missingInZh)
printDiff('Missing in en', missingInEn)

if (missingInZh.length === 0 && missingInEn.length === 0)
  console.log('\n✅ en/zh keys are fully aligned.')
else
  process.exitCode = 2
