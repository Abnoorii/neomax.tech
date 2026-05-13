'use client'

import { useState, useTransition } from 'react'
import { Download, Eye, Loader2, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  type: string
  titleEn: string
  titleDari: string
  descEn: string
  descDari: string
  icon: React.ElementType
  periodId: string
  locale: string
  available: boolean
  onView: () => void
}

export function ReportCard({
  type, titleEn, titleDari, descEn, descDari, icon: Icon,
  periodId, locale, available, onView,
}: Props) {
  const isRTL = locale !== 'en'
  const [downloading, startDownload] = useTransition()

  function handleCsvDownload() {
    const url = `/api/reports/csv?type=${type}&period=${periodId}`
    window.open(url, '_blank')
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', !available && 'opacity-60')}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Icon className="h-4 w-4 text-primary shrink-0" />
          {locale === 'en' ? titleEn : titleDari}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {locale === 'en' ? descEn : descDari}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!available}
            onClick={onView}
            className="gap-1.5 flex-1"
          >
            <Eye className="h-3.5 w-3.5" />
            {locale === 'en' ? 'View' : 'مشاهده'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!available || downloading}
            onClick={handleCsvDownload}
            className="gap-1.5 flex-1"
            title={locale === 'en' ? 'Download CSV' : 'دانلود CSV'}
          >
            {downloading
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <FileSpreadsheet className="h-3.5 w-3.5" />}
            CSV
          </Button>
        </div>
        {!available && (
          <p className="text-xs text-amber-600">
            {locale === 'en' ? 'No payroll run for this period.' : 'معاش برای این دوره محاسبه نشده.'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
