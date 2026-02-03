'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createToken } from './actions'

const tokenSchema = z.object({
  name: z.string().min(1, '请输入名称'),
  expire: z.string().refine((val) => {
    if (!val)
      return true
    return new Date(val).getTime() > Date.now()
  }, '过期时间不能早于当前时间'),
  quota: z.string().refine((val) => {
    const n = Number(val)
    return !Number.isNaN(n) && n >= 0
  }, '额度必须是大于等于 0 的数字'),
  unlimited: z.boolean(),
})

type TokenFormValues = z.infer<typeof tokenSchema>

export function TokenCreate() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const form = useForm<TokenFormValues>({
    resolver: zodResolver(tokenSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      expire: '',
      quota: '500000',
      unlimited: true,
    },
  })

  async function onSubmit(values: TokenFormValues) {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('unlimited_quota', values.unlimited.toString())
    if (!values.unlimited) {
      formData.append('remain_quota', values.quota)
    }
    else {
      formData.append('remain_quota', '0')
    }

    if (values.expire) {
      const ts = Math.floor(new Date(values.expire).getTime() / 1000)
      formData.append('expire_time', ts.toString())
    }
    else {
      formData.append('expire_time', '-1')
    }

    const res = await createToken(null, formData)

    if (res.success) {
      toast.success('创建成功')
      setIsOpen(false)
      form.reset()
      router.refresh()
    }
    else {
      toast.error(res.message || '创建失败')
    }
  }

  const unlimited = form.watch('unlimited')

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        {' '}
        创建令牌
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-xl border shadow-xl p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold font-mono tracking-tight">
                创建新令牌
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>名称</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：开发环境令牌" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expire"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-2">
                      <FormLabel>过期时间</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unlimited"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        不限额度
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {!unlimited && (
                  <FormField
                    control={form.control}
                    name="quota"
                    render={({ field }) => (
                      <FormItem className="flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200">
                        <FormLabel>额度 (1$ = 500k)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? '创建中...' : '创建'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </>
  )
}
