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
 * This component is ported from getLobeHubIcon in web/src/helpers/render.jsx.
 * It supports dot-separated strings to specify icon and properties.
 * Examples: "OpenAI.Color" or "OpenAI.Avatar.size=20".
 */
export function ModelIcon({ symbol, size = 14, className }: ModelIconProps) {
  let iconName = symbol
  if (typeof iconName === 'string')
    iconName = iconName.trim()

  // 1. If icon name is empty, render a fallback avatar with '?'.
  if (!iconName) {
    return (
      <Avatar className={className} style={{ width: size, height: size }}>
        <AvatarFallback className="text-[10px] bg-muted">?</AvatarFallback>
      </Avatar>
    )
  }

  // 2. Parse component path and dot-chained props.
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

  // 3. Fallback when target icon component is invalid.
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

  // 4. Parse dot-chained props.
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

  // Respect external size prop.
  if (props.size == null && size != null)
    props.size = size

  // 5. Render icon component.
  return (
    <div className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <IconComponent {...props} />
    </div>
  )
}
