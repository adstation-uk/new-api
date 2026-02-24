export type ModelMetadata = {
  id: string
  name?: string
  category: 'chat' | 'video' | 'image' | 'music'
  provider?: string
  description?: string
  base_url?: string
  context_window?: string
  knowledge_cutoff?: string
  capabilities?: string[]
  tags?: string[]
  icon?: string
  price?: string // Standardized display price (e.g. "$0.01")
  market_price?: string // Standardized market price
  billing_type?: 'token' | 'request'
  billing_unit?: string
}

export type CollectionMetadata = {
  key: string
  title: string
  description: string
  model_ids: string[]
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://your-domain.com/v1'

export const modelConfig: Record<string, Partial<ModelMetadata>> = {
  // OpenAI
  'gpt-4o': {
    name: 'GPT-4o',
    category: 'chat',
    provider: 'OpenAI',
    context_window: '128k',
    knowledge_cutoff: '2023-10',
    capabilities: ['Vision', 'Function Calling'],
    icon: 'OpenAI',
    price: '$0.0050',
    market_price: '$0.0100',
    billing_type: 'token',
    billing_unit: '/1K tokens',
    description: '旗舰多模态模型，支持文本、图像理解与函数调用，适合通用生产场景。',
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    category: 'chat',
    provider: 'OpenAI',
    context_window: '128k',
    knowledge_cutoff: '2023-12',
    icon: 'OpenAI',
    price: '$0.0300',
    market_price: '$0.0600',
    billing_type: 'token',
    billing_unit: '/1K tokens',
    description: '高性能大上下文模型，适合复杂推理与长文本任务。',
  },
  'dall-e-3': {
    name: 'DALL-E 3',
    category: 'image',
    provider: 'OpenAI',
    icon: 'OpenAI',
    price: '$0.0400',
    market_price: '$0.0800',
    billing_type: 'request',
    billing_unit: '/image',
    description: '高质量文生图模型，适用于营销素材与创意设计。',
  },
  'o1-preview': {
    name: 'OpenAI o1-preview',
    category: 'chat',
    provider: 'OpenAI',
    icon: 'OpenAI',
    price: '$0.0150',
    market_price: '$0.0600',
    billing_type: 'token',
    billing_unit: '/1K tokens',
  },

  // Claude
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    category: 'chat',
    provider: 'Anthropic',
    context_window: '200k',
    knowledge_cutoff: '2024-04',
    icon: 'Claude',
    price: '$0.0030',
    market_price: '$0.0150',
    billing_type: 'token',
    billing_unit: '/1K tokens',
    description: '均衡的高质量对话模型，在代码与内容生成任务中表现稳定。',
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    category: 'chat',
    provider: 'Anthropic',
    context_window: '200k',
    icon: 'Claude',
    price: '$0.0150',
    market_price: '$0.0750',
    billing_type: 'token',
    billing_unit: '/1K tokens',
  },

  // Google
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    category: 'chat',
    provider: 'Google',
    context_window: '2M',
    icon: 'Gemini',
    price: '$0.0035',
    market_price: '$0.0070',
    billing_type: 'token',
    billing_unit: '/1K tokens',
  },

  // Video Models
  'luma-ray': {
    name: 'Luma Ray',
    category: 'video',
    provider: 'Luma AI',
    price: '$0.1000',
    market_price: '$0.5000',
    billing_type: 'request',
    billing_unit: '/video',
    description: '视频生成模型，适用于高质感短视频与镜头风格化输出。',
  },
  'kling-v1': {
    name: 'Kling V1',
    category: 'video',
    provider: 'Kuaishou',
    price: '$0.1500',
    market_price: '$0.3000',
    billing_type: 'request',
    billing_unit: '/video',
    description: '面向图生视频与文本生成视频场景，支持更细腻的动作表现。',
  },

  // Music Models
  'suno-v3.5': {
    name: 'Suno V3.5',
    category: 'music',
    provider: 'Suno',
    price: '$0.1000',
    market_price: '$0.2000',
    billing_type: 'request',
    billing_unit: '/track',
  },
  'suno-v4': {
    name: 'Suno V4',
    category: 'music',
    provider: 'Suno',
    price: '$0.2000',
    market_price: '$0.4000',
    billing_type: 'request',
    billing_unit: '/track',
  },
  'udio-30': {
    name: 'Udio 30',
    category: 'music',
    provider: 'Udio',
    price: '$0.1000',
    market_price: '$0.2000',
    billing_type: 'request',
    billing_unit: '/track',
  },

  // DeepSeek
  'deepseek-chat': {
    name: 'DeepSeek Chat (V3)',
    category: 'chat',
    provider: 'DeepSeek',
    context_window: '64k',
    icon: 'DeepSeek',
    price: '$0.0001',
    market_price: '$0.0005',
    billing_type: 'token',
    billing_unit: '/1K tokens',
    description: '高性价比通用对话模型，适合客服、问答与轻量生成任务。',
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    category: 'chat',
    provider: 'DeepSeek',
    icon: 'DeepSeek',
    price: '$0.0001',
    market_price: '$0.0005',
    billing_type: 'token',
    billing_unit: '/1K tokens',
  },
}

export const collectionsConfig: Record<string, CollectionMetadata> = {
  openai: {
    key: 'openai',
    title: 'OpenAI Models',
    description: 'OpenAI 模型集合，涵盖通用对话、多模态理解与图像生成能力，适合从原型到生产环境的多种业务场景。',
    model_ids: ['gpt-4o', 'gpt-4-turbo', 'dall-e-3', 'o1-preview'],
  },
  anthropic: {
    key: 'anthropic',
    title: 'Anthropic Models',
    description: 'Anthropic 模型集合，强调高质量对话、长上下文处理与稳定输出，适合企业级内容与代码任务。',
    model_ids: ['claude-3-5-sonnet', 'claude-3-opus'],
  },
  google: {
    key: 'google',
    title: 'Google Models',
    description: 'Google 模型集合，覆盖大上下文与多模态能力，适合检索增强、文档分析与复杂交互场景。',
    model_ids: ['gemini-1.5-pro'],
  },
  deepseek: {
    key: 'deepseek',
    title: 'DeepSeek Models',
    description: 'DeepSeek 模型集合，具备高性价比的对话与代码能力，适合成本敏感型生产业务。',
    model_ids: ['deepseek-chat', 'deepseek-coder'],
  },
  video: {
    key: 'video',
    title: 'Video Models',
    description: '视频模型集合，面向图生视频与文本生成视频等创作场景。',
    model_ids: ['luma-ray', 'kling-v1'],
  },
  music: {
    key: 'music',
    title: 'Music Models',
    description: '音乐模型集合，适用于歌曲创作、风格化编曲与多场景音频生产。',
    model_ids: ['suno-v3.5', 'suno-v4', 'udio-30'],
  },
}

function getDefaultBillingType(category: ModelMetadata['category']): 'token' | 'request' {
  return category === 'video' || category === 'music' ? 'request' : 'token'
}

function getDefaultBillingUnit(
  category: ModelMetadata['category'],
  billingType: 'token' | 'request',
): string {
  if (billingType === 'token')
    return '/1K tokens'

  if (category === 'music')
    return '/track'
  if (category === 'image')
    return '/image'
  return '/video'
}

function getDefaultDescription(metadata: {
  name: string
  provider: string
  category: ModelMetadata['category']
}): string {
  const categoryText: Record<ModelMetadata['category'], string> = {
    chat: '对话与内容生成',
    video: '视频生成',
    image: '图像生成',
    music: '音乐生成',
  }

  return `${metadata.provider} 的 ${metadata.name}，适用于 ${categoryText[metadata.category]} 场景。`
}

// Heuristic to get category if not explicitly defined
export function getModelCategory(modelId: string): 'chat' | 'video' | 'image' | 'music' {
  const id = modelId.toLowerCase()
  if (modelConfig[modelId]?.category)
    return modelConfig[modelId].category!

  if (id.includes('suno') || id.includes('music') || id.includes('audio'))
    return 'music'
  if (id.includes('sora') || id.includes('video') || id.includes('luma') || id.includes('viggle') || id.includes('runway'))
    return 'video'
  if (id.includes('dall') || id.includes('midjourney') || id.includes('mj') || id.includes('image') || id.includes('flux') || id.includes('stable-diffusion'))
    return 'image'

  return 'chat'
}

export function getModelMetadata(modelId: string): ModelMetadata {
  const config = modelConfig[modelId] || {}
  const category = getModelCategory(modelId)
  const provider = config.provider || 'Other'
  const billingType = config.billing_type || getDefaultBillingType(category)
  return {
    id: modelId,
    name: config.name || modelId,
    category,
    provider,
    context_window: config.context_window || 'Unknown',
    knowledge_cutoff: config.knowledge_cutoff || 'N/A',
    capabilities: config.capabilities || [],
    icon: config.icon || modelId,
    price: config.price,
    market_price: config.market_price,
    description: config.description || getDefaultDescription({
      name: config.name || modelId,
      provider,
      category,
    }),
    base_url: config.base_url || API_BASE_URL,
    billing_type: billingType,
    billing_unit: config.billing_unit || getDefaultBillingUnit(category, billingType),
  }
}

export function getCollectionMetadata(key: string): CollectionMetadata | null {
  const normalizedKey = key.toLowerCase()
  return collectionsConfig[normalizedKey] || null
}
