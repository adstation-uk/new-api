import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function renderNumber(num: number): string {
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`
  }
  else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  else if (num >= 10000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  else {
    return num.toString()
  }
}

export function renderQuota(quota: number, digits = 2): string {
  // We'll simplify this for now, assuming standard USD display as that's default
  // In a real app, we'd fetch these from context or store
  const quotaPerUnit = 500000 // Default from common/constants.go
  const resultUSD = quota / quotaPerUnit
  const symbol = '$'
  const value = resultUSD

  const fixedResult = value.toFixed(digits)
  if (Number.parseFloat(fixedResult) === 0 && quota > 0 && value > 0) {
    const minValue = 10 ** -digits
    return symbol + minValue.toFixed(digits)
  }
  return symbol + fixedResult
}

export function renderStatus(status: number) {
  switch (status) {
    case 1:
      return '已启用'
    case 2:
      return '已禁用'
    case 3:
      return '已过期'
    case 4:
      return '已耗尽'
    default:
      return '未知'
  }
}

export function getStatusBadgeClass(status: number) {
  switch (status) {
    case 1:
      return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400'
    case 2:
      return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    case 3:
      return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400'
    case 4:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
    default:
      return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
  }
}

export function renderLogType(type: number) {
  switch (type) {
    case 1:
      return '充值'
    case 2:
      return '消费'
    case 3:
      return '管理'
    case 4:
      return '系统'
    case 5:
      return '错误'
    case 6:
      return '退款'
    default:
      return '未知'
  }
}

export function getLogTypeClass(type: number) {
  switch (type) {
    case 1:
      return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    case 2:
      return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
    case 3:
      return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
    case 4:
      return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
    case 5:
      return 'text-red-600 bg-red-50 dark:bg-red-900/20'
    case 6:
      return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20'
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
  }
}
