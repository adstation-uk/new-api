'use client'

import {
  Clock,
  Copy,
  Loader2,
  Play,
  Search,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { testChannel } from './actions'

type ModelTestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: any
}

export function ModelTestDialog({ open, onOpenChange, channel }: ModelTestDialogProps) {
  const t = useTranslations('Page.Console.Channel.modelTest')
  const ENDPOINT_TYPES = [
    { value: 'auto', label: t('endpoint.auto') },
    { value: 'openai', label: 'OpenAI (/v1/chat/completions)' },
    { value: 'openai-response', label: 'OpenAI Response (/v1/responses)' },
    { value: 'anthropic', label: 'Anthropic (/v1/messages)' },
    { value: 'gemini', label: 'Gemini (/v1beta/models)' },
    { value: 'jina-rerank', label: 'Jina Rerank (/rerank)' },
    { value: 'image-generation', label: t('endpoint.imageGeneration') },
    { value: 'embeddings', label: 'Embeddings (/v1/embeddings)' },
  ]
  const [search, setSearch] = React.useState('')
  const [endpointType, setEndpointType] = React.useState('auto')
  const [results, setResults] = React.useState<Record<string, { success: boolean, time: number, error?: string }>>({})
  const [testing, setTesting] = React.useState<Record<string, boolean>>({})
  const [isBatchTesting, setIsBatchTesting] = React.useState(false)

  const models = React.useMemo(() => {
    if (!channel?.models)
      return []
    return channel.models.split(',').filter(Boolean)
  }, [channel])

  const filteredModels = React.useMemo(() => {
    return models.filter((m: string) => m.toLowerCase().includes(search.toLowerCase()))
  }, [models, search])

  const handleTest = async (model: string) => {
    setTesting(prev => ({ ...prev, [model]: true }))
    try {
      const start = Date.now()
      const res = await testChannel(channel.id, model, endpointType === 'auto' ? '' : endpointType)
      const end = Date.now()
      const latency = (end - start) / 1000

      setResults(prev => ({
        ...prev,
        [model]: {
          success: res.success,
          time: res.time || latency,
          error: res.message,
        },
      }))
    }
    catch {
      setResults(prev => ({
        ...prev,
        [model]: {
          success: false,
          time: 0,
          error: t('execFailed'),
        },
      }))
    }
    finally {
      setTesting(prev => ({ ...prev, [model]: false }))
    }
  }

  const handleBatchTest = async () => {
    setIsBatchTesting(true)
    for (const model of filteredModels) {
      if (!open)
        break
      await handleTest(model)
    }
    setIsBatchTesting(false)
  }

  const handleCopySuccess = () => {
    const successModels = filteredModels.filter((m: string) => results[m]?.success)
    if (successModels.length === 0) {
      toast.info(t('noSuccessful'))
      return
    }
    navigator.clipboard.writeText(successModels.join(','))
    toast.success(t('copiedSuccessful', { count: successModels.length }))
  }

  // Effect to clear results when channel changes
  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setResults({})
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setTesting({})
      // eslint-disable-next-line react-hooks-extra/no-direct-set-state-in-use-effect
      setIsBatchTesting(false)
    }
  }, [channel?.id, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>
              {channel?.name || t('unnamed')}
              {' '}
              -
              {' '}
              {t('title')}
            </span>
            <Badge variant="outline">
              {models.length}
              {t('models')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4 overflow-hidden h-full">
          <div className="flex flex-wrap gap-2 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium mb-1 block">{t('searchModel')}</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  className="pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="w-[180px]">
              <label className="text-xs font-medium mb-1 block">{t('endpointType')}</label>
              <Select value={endpointType} onValueChange={setEndpointType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectEndpoint')} />
                </SelectTrigger>
                <SelectContent>
                  {ENDPOINT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="h-10" onClick={handleCopySuccess}>
              <Copy className="h-4 w-4 mr-1" />
              {' '}
              {t('copySuccess')}
            </Button>
          </div>

          <div className="flex-1 overflow-auto border rounded-md min-h-0">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                <TableRow>
                  <TableHead>{t('columns.model')}</TableHead>
                  <TableHead className="w-[180px]">{t('columns.status')}</TableHead>
                  <TableHead className="w-[80px] text-right">{t('columns.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredModels.map((model: string) => (
                  <TableRow key={model}>
                    <TableCell className="font-medium whitespace-nowrap">{model}</TableCell>
                    <TableCell>
                      {testing[model]
                        ? (
                            <div className="flex items-center gap-1 text-blue-500">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-[10px]">{t('requesting')}</span>
                            </div>
                          )
                        : results[model]
                          ? (
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-1.5">
                                  {results[model].success
                                    ? (
                                        <Badge className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200 h-5 px-1.5 text-[10px]">{t('success')}</Badge>
                                      )
                                    : (
                                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">{t('failed')}</Badge>
                                      )}
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                    <Clock className="h-3 w-3" />
                                    {' '}
                                    {results[model].time.toFixed(2)}
                                    s
                                  </span>
                                </div>
                                {!results[model].success && results[model].error && (
                                  <span className="text-[10px] text-red-500 truncate max-w-[150px] block" title={results[model].error}>
                                    {results[model].error}
                                  </span>
                                )}
                              </div>
                            )
                          : (
                              <span className="text-[10px] text-muted-foreground italic">{t('notStarted')}</span>
                            )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleTest(model)}
                        disabled={testing[model] || isBatchTesting}
                        title={t('testThisModel')}
                      >
                        <Play className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredModels.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                      {t('empty')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between w-full border-t pt-4">
          <div className="text-[11px] text-muted-foreground bg-slate-50 p-2 rounded border leading-tight">
            {t('tip')}
          </div>
          <Button onClick={handleBatchTest} disabled={isBatchTesting || filteredModels.length === 0} size="sm">
            {isBatchTesting
              ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {' '}
                    {t('batchTesting')}
                  </>
                )
              : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    {t('batchTest')}
                    {' '}
                    (
                    {filteredModels.length}
                    )
                  </>
                )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
