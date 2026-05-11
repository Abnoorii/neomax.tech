import { Construction } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ModulePlaceholderProps {
  titleEn: string
  titleDari: string
  descEn: string
  descDari: string
  icon: React.ElementType
  locale: string
  phase?: string
}

export function ModulePlaceholder({
  titleEn,
  titleDari,
  descEn,
  descDari,
  icon: Icon,
  locale,
  phase = 'B',
}: ModulePlaceholderProps) {
  const isRTL = locale !== 'en'
  const title = isRTL ? titleDari : titleEn
  const desc = isRTL ? descDari : descEn

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <Icon className="h-7 w-7 text-amber-500" />
          {title}
        </h1>
      </div>

      <Card className="border-dashed border-2 border-amber-300">
        <CardHeader className="text-center pt-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-xl text-slate-700">
            {isRTL ? 'در حال ساخت' : `Phase ${phase} — Coming Soon`}
          </CardTitle>
          <CardDescription className="max-w-md mx-auto">{desc}</CardDescription>
        </CardHeader>
        <CardContent className="pb-10">
          <div className="text-center text-sm text-slate-400">
            {isRTL
              ? `این ماژول در مرحله ${phase} تکمیل می‌شود.`
              : `This module is scheduled for Phase ${phase} of the build.`}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
