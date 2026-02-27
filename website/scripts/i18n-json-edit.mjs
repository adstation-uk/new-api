import fs from 'node:fs'
import path from 'node:path'

function printUsage() {
  console.log(`Usage:
  node scripts/i18n-json-edit.mjs --files locales/en.json locales/zh.json --set Common.oauth.loading="Loading..."
  node scripts/i18n-json-edit.mjs --files locales/en.json locales/zh.json --remove Common.oauth.loading
  node scripts/i18n-json-edit.mjs --files locales/en.json locales/zh.json --ops scripts/i18n-ops.json

Options:
  --files <file...>      One or more locale json files
  --set <path=value>     Set/update a value at dot path (repeatable)
  --remove <path>        Remove a key at dot path (repeatable)
  --ops <file>           JSON operations file: {"set": {"a.b": "x"}, "remove": ["c.d"]}
  --dry-run              Print summary only, do not write files
  --help                 Show help
`)
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const files = []
  const setOps = []
  const removeOps = []
  let opsFile = ''
  let dryRun = false

  for (let index = 0; index < args.length; index++) {
    const arg = args[index]

    if (arg === '--help' || arg === '-h') {
      printUsage()
      process.exit(0)
    }

    if (arg === '--dry-run') {
      dryRun = true
      continue
    }

    if (arg === '--ops') {
      const next = args[index + 1]
      if (!next || next.startsWith('--'))
        throw new Error('Missing value for --ops')
      opsFile = next
      index++
      continue
    }

    if (arg === '--files') {
      let offset = index + 1
      while (offset < args.length && !args[offset].startsWith('--')) {
        files.push(args[offset])
        offset++
      }
      if (offset === index + 1)
        throw new Error('Missing value(s) for --files')
      index = offset - 1
      continue
    }

    if (arg === '--set') {
      const next = args[index + 1]
      if (!next || next.startsWith('--'))
        throw new Error('Missing value for --set')
      setOps.push(next)
      index++
      continue
    }

    if (arg === '--remove') {
      const next = args[index + 1]
      if (!next || next.startsWith('--'))
        throw new Error('Missing value for --remove')
      removeOps.push(next)
      index++
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  if (files.length === 0)
    throw new Error('At least one file is required via --files')

  if (!opsFile && setOps.length === 0 && removeOps.length === 0)
    throw new Error('No operation provided. Use --set, --remove, or --ops')

  return {
    dryRun,
    files,
    opsFile,
    removeOps,
    setOps,
  }
}

function parseSetExpression(expression) {
  const separatorIndex = expression.indexOf('=')
  if (separatorIndex <= 0)
    throw new Error(`Invalid --set format: ${expression}`)

  const dotPath = expression.slice(0, separatorIndex).trim()
  const rawValue = expression.slice(separatorIndex + 1).trim()
  if (!dotPath)
    throw new Error(`Invalid --set path: ${expression}`)

  let value
  try {
    value = JSON.parse(rawValue)
  }
  catch {
    value = rawValue
  }

  return { dotPath, value }
}

function loadOperations(config) {
  const operations = {
    remove: [...config.removeOps],
    set: new Map(),
  }

  for (const expression of config.setOps) {
    const { dotPath, value } = parseSetExpression(expression)
    operations.set.set(dotPath, value)
  }

  if (config.opsFile) {
    const absOpsPath = path.resolve(process.cwd(), config.opsFile)
    const text = fs.readFileSync(absOpsPath, 'utf8')
    const parsed = JSON.parse(text)

    if (parsed && typeof parsed === 'object') {
      if (parsed.set && typeof parsed.set === 'object' && !Array.isArray(parsed.set)) {
        for (const [dotPath, value] of Object.entries(parsed.set))
          operations.set.set(dotPath, value)
      }

      if (Array.isArray(parsed.remove)) {
        for (const dotPath of parsed.remove) {
          if (typeof dotPath === 'string')
            operations.remove.push(dotPath)
        }
      }
    }
  }

  return operations
}

function getPathParts(dotPath) {
  const parts = dotPath.split('.').map(part => part.trim()).filter(Boolean)
  if (parts.length === 0)
    throw new Error(`Invalid dot path: ${dotPath}`)
  return parts
}

function setByPath(target, dotPath, value) {
  const parts = getPathParts(dotPath)
  let cursor = target

  for (let index = 0; index < parts.length - 1; index++) {
    const key = parts[index]
    const current = cursor[key]
    if (!current || typeof current !== 'object' || Array.isArray(current))
      cursor[key] = {}
    cursor = cursor[key]
  }

  const lastKey = parts[parts.length - 1]
  const existed = Object.hasOwn(cursor, lastKey)
  cursor[lastKey] = value
  return existed ? 'updated' : 'added'
}

function deleteByPath(target, dotPath) {
  const parts = getPathParts(dotPath)
  const stack = []
  let cursor = target

  for (let index = 0; index < parts.length - 1; index++) {
    const key = parts[index]
    if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor) || !Object.hasOwn(cursor, key))
      return false
    stack.push({ key, parent: cursor })
    cursor = cursor[key]
  }

  if (!cursor || typeof cursor !== 'object' || Array.isArray(cursor))
    return false

  const lastKey = parts[parts.length - 1]
  if (!Object.hasOwn(cursor, lastKey))
    return false

  delete cursor[lastKey]

  for (let index = stack.length - 1; index >= 0; index--) {
    const { key, parent } = stack[index]
    const child = parent[key]
    if (child && typeof child === 'object' && !Array.isArray(child) && Object.keys(child).length === 0)
      delete parent[key]
    else
      break
  }

  return true
}

function loadJson(filePath) {
  const text = fs.readFileSync(filePath, 'utf8')
  try {
    return JSON.parse(text)
  }
  catch (error) {
    throw new Error(`Failed to parse JSON: ${filePath}\n${error instanceof Error ? error.message : String(error)}`)
  }
}

function main() {
  const config = parseArgs(process.argv)
  const operations = loadOperations(config)

  const absFiles = config.files.map(file => path.resolve(process.cwd(), file))
  const report = []

  for (const filePath of absFiles) {
    const json = loadJson(filePath)
    let added = 0
    let updated = 0
    let removed = 0

    for (const [dotPath, value] of operations.set.entries()) {
      const result = setByPath(json, dotPath, value)
      if (result === 'added')
        added++
      else
        updated++
    }

    for (const dotPath of operations.remove) {
      if (deleteByPath(json, dotPath))
        removed++
    }

    if (!config.dryRun)
      fs.writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`, 'utf8')

    report.push({
      added,
      filePath,
      removed,
      updated,
    })
  }

  for (const item of report) {
    const relative = path.relative(process.cwd(), item.filePath) || item.filePath
    console.log(`${config.dryRun ? '[dry-run]' : '[written]'} ${relative} -> added: ${item.added}, updated: ${item.updated}, removed: ${item.removed}`)
  }
}

try {
  main()
}
catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
