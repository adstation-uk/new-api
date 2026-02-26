'use client'

import {
  Claude,
  DeepSeek,
  Doubao,
  Gemini,
  Minimax,
  Moonshot,
  Ollama,
  OpenAI,
  Qwen,
  Wenxin,
  XAI,
  Zhipu,
} from '@lobehub/icons'
import { Search } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'

type ModelSelectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  models: string[]
  selectedModels: string[]
  onConfirm: (selected: string[]) => void
}

const CATEGORIES = [
  {
    id: 'openai',
    label: 'OpenAI',
    icon: <OpenAI size={18} />,
    filter: (m: string) => /gpt|dall-e|whisper|tts-1|text-embedding-3|text-moderation|babbage|davinci|curie|ada|o1|o3|o4/i.test(m),
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    icon: <Claude.Color size={18} />,
    filter: (m: string) => /claude/i.test(m),
  },
  {
    id: 'gemini',
    label: 'Gemini',
    icon: <Gemini.Color size={18} />,
    filter: (m: string) => /gemini|gemma|learnlm|embedding-|text-embedding-004|imagen-4|veo-|aqa/i.test(m),
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    icon: <DeepSeek.Color size={18} />,
    filter: (m: string) => /deepseek/i.test(m),
  },
  {
    id: 'qwen',
    labelKey: 'vendor.qwen',
    icon: <Qwen.Color size={18} />,
    filter: (m: string) => /qwen/i.test(m),
  },
  {
    id: 'zhipu',
    labelKey: 'vendor.zhipu',
    icon: <Zhipu.Color size={18} />,
    filter: (m: string) => /chatglm|glm-|cogview|cogvideo/i.test(m),
  },
  {
    id: 'moonshot',
    label: 'Moonshot',
    icon: <Moonshot size={18} />,
    filter: (m: string) => /moonshot|kimi/i.test(m),
  },
  {
    id: 'minimax',
    label: 'MiniMax',
    icon: <Minimax.Color size={18} />,
    filter: (m: string) => /abab|minimax/i.test(m),
  },
  {
    id: 'baidu',
    labelKey: 'vendor.baidu',
    icon: <Wenxin.Color size={18} />,
    filter: (m: string) => /ernie/i.test(m),
  },
  {
    id: 'doubao',
    labelKey: 'vendor.doubao',
    icon: <Doubao.Color size={18} />,
    filter: (m: string) => /doubao/i.test(m),
  },
  {
    id: 'xai',
    label: 'X.AI',
    icon: <XAI size={18} />,
    filter: (m: string) => /grok/i.test(m),
  },
  {
    id: 'ollama',
    label: 'Ollama',
    icon: <Ollama size={18} />,
    filter: (m: string) => /ollama/i.test(m),
  },
]

export function ModelSelectDialog({
  open,
  onOpenChange,
  models,
  selectedModels: initialSelected,
  onConfirm,
}: ModelSelectDialogProps) {
  const t = useTranslations('Page.Console.Channel.modelSelect')
  const [search, setSearch] = React.useState('')
  const [selected, setSelected] = React.useState<string[]>([])
  const [activeTab, setActiveTab] = React.useState<'new' | 'existing'>('new')

  const existingSet = React.useMemo(() => new Set(initialSelected), [initialSelected])
  const categories = React.useMemo(() => CATEGORIES.map(cat => ({ ...cat, label: cat.labelKey ? t(cat.labelKey) : cat.label })), [t])

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setSelected(initialSelected)
    }
  }, [open, initialSelected])

  const filteredModels = React.useMemo(() => {
    return models.filter(m => m.toLowerCase().includes(search.toLowerCase()))
  }, [models, search])

  const newModelsData = React.useMemo(() => filteredModels.filter(m => !existingSet.has(m)), [filteredModels, existingSet])
  const existingModelsData = React.useMemo(() => filteredModels.filter(m => existingSet.has(m)), [filteredModels, existingSet])

  const categorize = React.useCallback((modelList: string[]) => {
    const results: Record<string, { label: string, icon: React.ReactNode, models: string[] }> = {}
    const uncategorized: string[] = []

    modelList.forEach((m) => {
      let matched = false
      for (const cat of categories) {
        if (cat.filter(m)) {
          if (!results[cat.id]) {
            results[cat.id] = { label: cat.label, icon: cat.icon, models: [] }
          }
          results[cat.id].models.push(m)
          matched = true
          break
        }
      }
      if (!matched)
        uncategorized.push(m)
    })

    if (uncategorized.length > 0) {
      results.other = { label: t('other'), icon: null, models: uncategorized }
    }
    return results
  }, [categories, t])

  const newCategorized = React.useMemo(() => categorize(newModelsData), [categorize, newModelsData])
  const existingCategorized = React.useMemo(() => categorize(existingModelsData), [categorize, existingModelsData])

  const toggleModel = (model: string) => {
    setSelected(prev =>
      prev.includes(model)
        ? prev.filter(m => m !== model)
        : [...prev, model],
    )
  }

  const toggleCategory = (categoryModels: string[]) => {
    const allIn = categoryModels.every(m => selected.includes(m))
    if (allIn) {
      setSelected(prev => prev.filter(m => !categoryModels.includes(m)))
    }
    else {
      const toAdd = categoryModels.filter(m => !selected.includes(m))
      setSelected(prev => [...prev, ...toAdd])
    }
  }

  const currentCategorized = activeTab === 'new' ? newCategorized : existingCategorized

  // Automatic tab switching
  React.useEffect(() => {
    if (open) {
      if (newModelsData.length > 0) {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setActiveTab('new')
      }
      else {
        // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
        setActiveTab('existing')
      }
    }
  }, [open, newModelsData.length])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between gap-4">
            <DialogTitle>{t('title')}</DialogTitle>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'new' ? 'bg-white shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('new')}
              >
                {t('new')}
                {' '}
                (
                {newModelsData.length}
                )
              </button>
              <button
                className={`px-3 py-1 text-xs rounded-md transition-all ${activeTab === 'existing' ? 'bg-white shadow-sm font-medium' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => setActiveTab('existing')}
              >
                {t('existing')}
                {' '}
                (
                {existingModelsData.length}
                )
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 flex flex-col overflow-hidden">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              className="pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-auto space-y-6 pr-2">
            {Object.entries(currentCategorized).map(([catId, cat]) => (
              <div key={catId} className="space-y-3">
                <div className="flex items-center justify-between bg-slate-50 p-2 px-3 rounded-md border sticky top-0 z-10 shadow-sm">
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span className="font-semibold text-sm">{cat.label}</span>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{cat.models.length}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">
                      {t('selected')}
                      {' '}
                      {cat.models.filter(m => selected.includes(m)).length}
                      {' '}
                      /
                      {cat.models.length}
                    </span>
                    <Checkbox
                      checked={cat.models.every(m => selected.includes(m))}
                      onCheckedChange={() => toggleCategory(cat.models)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 px-1">
                  {cat.models.map(model => (
                    <div
                      key={model}
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-colors ${selected.includes(model) ? 'bg-blue-50 border-blue-200' : 'hover:bg-slate-50'}`}
                      onClick={() => toggleModel(model)}
                    >
                      <Checkbox
                        checked={selected.includes(model)}
                        onCheckedChange={() => toggleModel(model)}
                        onClick={e => e.stopPropagation()}
                      />
                      <span className={`text-xs truncate ${selected.includes(model) ? 'text-blue-700 font-medium' : ''}`} title={model}>
                        {model}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(currentCategorized).length === 0 && (
              <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">{t('empty')}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-2 flex items-center justify-between sm:justify-between border-t bg-slate-50">
          <div className="text-sm">
            {t('totalSelected')}
            {' '}
            <span className="font-bold text-blue-600">{selected.length}</span>
            {t('models')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={() => {
              onConfirm(selected)
              onOpenChange(false)
            }}
            >
              {t('confirm')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
