'use client'

export function HeroTitle() {
  return (
    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-foreground mb-6">
      欢迎使用 New API
    </h1>
  )
}

export function HeroSubtitle() {
  return (
    <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl leading-relaxed">
      高性能大模型 API 管理平台
    </p>
  )
}
