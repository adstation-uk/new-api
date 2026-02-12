export type ModelMetadata = {
  id: string
  name?: string
  category: 'chat' | 'video' | 'image' | 'music'
  provider?: string
  description?: string
  context_window?: string
  knowledge_cutoff?: string
  capabilities?: string[]
  tags?: string[]
  icon?: string
  price?: string // Standardized display price (e.g. "$0.01")
  market_price?: string // Standardized market price
}

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
  },
  'dall-e-3': {
    name: 'DALL-E 3',
    category: 'image',
    provider: 'OpenAI',
    icon: 'OpenAI',
    price: '$0.0400',
    market_price: '$0.0800',
  },
  'o1-preview': {
    name: 'OpenAI o1-preview',
    category: 'chat',
    provider: 'OpenAI',
    icon: 'OpenAI',
    price: '$0.0150',
    market_price: '$0.0600',
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
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    category: 'chat',
    provider: 'Anthropic',
    context_window: '200k',
    icon: 'Claude',
    price: '$0.0150',
    market_price: '$0.0750',
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
  },

  // Video Models
  'luma-ray': {
    name: 'Luma Ray',
    category: 'video',
    provider: 'Luma AI',
    price: '$0.1000',
    market_price: '$0.5000',
  },
  'kling-v1': {
    name: 'Kling V1',
    category: 'video',
    provider: 'Kuaishou',
    price: '$0.1500',
    market_price: '$0.3000',
  },

  // Music Models
  'suno-v3.5': {
    name: 'Suno V3.5',
    category: 'music',
    provider: 'Suno',
    price: '$0.1000',
    market_price: '$0.2000',
  },
  'suno-v4': {
    name: 'Suno V4',
    category: 'music',
    provider: 'Suno',
    price: '$0.2000',
    market_price: '$0.4000',
  },
  'udio-30': {
    name: 'Udio 30',
    category: 'music',
    provider: 'Udio',
    price: '$0.1000',
    market_price: '$0.2000',
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
  },
  'deepseek-coder': {
    name: 'DeepSeek Coder',
    category: 'chat',
    provider: 'DeepSeek',
    icon: 'DeepSeek',
    price: '$0.0001',
    market_price: '$0.0005',
  },
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
  return {
    id: modelId,
    name: config.name || modelId,
    category: getModelCategory(modelId),
    provider: config.provider || 'Other',
    context_window: config.context_window || 'Unknown',
    knowledge_cutoff: config.knowledge_cutoff || 'N/A',
    capabilities: config.capabilities || [],
    icon: config.icon || modelId,
    price: config.price,
    market_price: config.market_price,
    description: config.description,
  }
}
