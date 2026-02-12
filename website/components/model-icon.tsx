'use client'

import * as LobeIcons from '@lobehub/icons'

import * as React from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

type ModelIconProps = {
  symbol?: string
  size?: number
  className?: string
}

/**
 * 这是一个从原项目 web/src/helpers/render.jsx 中 getLobeHubIcon 函数移植而来的组件。
 * 它支持通过点号分隔的字符串来指定图标和属性。
 * 例如："OpenAI.Color" 或 "OpenAI.Avatar.size=20"
 */
export function ModelIcon({ symbol, size = 14, className }: ModelIconProps) {
  let iconName = symbol
  if (typeof iconName === 'string')
    iconName = iconName.trim()

  // 1. 如果没有图标名称，返回问号头像 (对应原项目 !iconName 逻辑)
  if (!iconName) {
    return (
      <Avatar className={className} style={{ width: size, height: size }}>
        <AvatarFallback className="text-[10px] bg-muted">?</AvatarFallback>
      </Avatar>
    )
  }

  // 2. 解析组件路径与点号链式属性
  const segments = String(iconName).split('.')
  const baseKey = segments[0]
  // @ts-expect-error LobeIcons index access
  const BaseIcon = LobeIcons[baseKey]

  let IconComponent: any
  let propStartIndex = 1

  if (BaseIcon && segments.length > 1 && BaseIcon[segments[1]]) {
    IconComponent = BaseIcon[segments[1]]
    propStartIndex = 2
  }
  else {
    // @ts-expect-error LobeIcons index access
    IconComponent = LobeIcons[baseKey]
    propStartIndex = 1
  }

  // 3. 失败兜底 (对应原项目 !IconComponent 逻辑)
  if (
    !IconComponent
    || (typeof IconComponent !== 'function' && typeof IconComponent !== 'object')
  ) {
    const firstLetter = String(iconName).charAt(0).toUpperCase()
    return (
      <Avatar className={className} style={{ width: size, height: size }}>
        <AvatarFallback className="text-[10px] bg-muted">{firstLetter}</AvatarFallback>
      </Avatar>
    )
  }

  // 4. 解析点号链式属性
  const props: any = {}
  const parseValue = (raw: any) => {
    if (raw == null)
      return true
    let v = String(raw).trim()
    if (v.startsWith('{') && v.endsWith('}')) {
      v = v.slice(1, -1).trim()
    }
    if (
      (v.startsWith('"') && v.endsWith('"'))
      || (v.startsWith('\'') && v.endsWith('\''))
    ) {
      return v.slice(1, -1)
    }
    if (v === 'true')
      return true
    if (v === 'false')
      return false
    if (/^-?\d+(?:\.\d+)?$/.test(v))
      return Number(v)
    return v
  }

  for (let i = propStartIndex; i < segments.length; i++) {
    const seg = segments[i]
    if (!seg)
      continue
    const eqIdx = seg.indexOf('=')
    if (eqIdx === -1) {
      props[seg.trim()] = true
      continue
    }
    const key = seg.slice(0, eqIdx).trim()
    const valRaw = seg.slice(eqIdx + 1).trim()
    props[key] = parseValue(valRaw)
  }

  // 兼容外部传入的 size
  if (props.size == null && size != null)
    props.size = size

  // 5. 渲染
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent {...props} />
    </div>
  )
}
