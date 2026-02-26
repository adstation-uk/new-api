'use client'

import { Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import * as React from 'react'
import { toast } from 'sonner'
import { ModelIcon } from '@/components/model-icon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { deleteVendor, saveVendor } from './actions'

type Vendor = {
  id: number
  name: string
  icon: string
  description?: string
  status: number
}

type VendorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendors: Vendor[]
}

export function VendorDialog({ open, onOpenChange, vendors }: VendorDialogProps) {
  const t = useTranslations('Page.Console.Models.vendorDialog')
  const commonT = useTranslations('Common')
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)
  const [formData, setFormData] = React.useState<Partial<Vendor>>({})

  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id)
    setFormData(vendor)
    setIsAdding(false)
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({})
  }

  const handleSave = async () => {
    if (!formData.name) {
      toast.error(t('validation.nameRequired'))
      return
    }

    const loadingToast = toast.loading(t('toast.saving'))
    try {
      const result = await saveVendor(formData)
      if (result.success) {
        toast.success(formData.id ? t('toast.updateSuccess') : t('toast.createSuccess'))
        handleCancel()
      }
      else {
        toast.error(result.message || t('toast.saveFailed'))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!confirm(t('confirmDelete')))
      return

    const loadingToast = toast.loading(t('toast.deleting'))
    try {
      const result = await deleteVendor(id)
      if (result.success) {
        toast.success(t('toast.deleteSuccess'))
      }
      else {
        toast.error(result.message || t('toast.deleteFailed'))
      }
    }
    catch {
      toast.error(commonT('errors.network'))
    }
    finally {
      toast.dismiss(loadingToast)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4">
          <div className="flex justify-end mb-4">
            {!isAdding && !editingId && (
              <Button onClick={() => setIsAdding(true)} size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                {t('add')}
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">{t('columns.icon')}</TableHead>
                <TableHead className="w-[150px]">{t('columns.name')}</TableHead>
                <TableHead>{t('columns.description')}</TableHead>
                <TableHead className="w-[120px] text-right">{t('columns.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(isAdding || editingId) && (
                <TableRow className="bg-muted/30">
                  <TableCell>
                    <ModelIcon symbol={formData.icon} size={18} />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('namePlaceholder')}
                      className="h-8 text-xs"
                    />
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Input
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t('descriptionPlaceholder')}
                      className="h-8 text-xs flex-1"
                    />
                    <Input
                      value={formData.icon || ''}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      placeholder={t('iconPlaceholder')}
                      className="h-8 text-xs w-28"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button onClick={handleSave} size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button onClick={handleCancel} size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {vendors.map(v => (
                editingId !== v.id && (
                  <TableRow key={v.id}>
                    <TableCell>
                      <ModelIcon symbol={v.icon} size={18} />
                    </TableCell>
                    <TableCell className="font-medium text-xs">{v.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {v.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button onClick={() => handleEdit(v)} size="icon" variant="ghost" className="h-8 w-8">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button onClick={() => handleDelete(v.id)} size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              ))}
              {vendors.length === 0 && !isAdding && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground text-xs">
                    {t('empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
