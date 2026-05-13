'use client'

import { useState, useTransition } from 'react'
import { Send, Loader2, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { nlQuery } from '@/app/actions/ai'

interface Message {
  role: 'user' | 'assistant'
  text: string
  latencyMs?: number
}

interface Props {
  periodId: string
  locale: string
}

const SUGGESTIONS = {
  en: [
    'What is the total labor cost this month?',
    'Which section has the highest wages?',
    'How many employees were absent more than 3 days?',
    'Show me the top 3 earners this period.',
  ],
  dari: [
    'مجموع هزینه نیروی کار این ماه چقدر است؟',
    'کدام بخش بیشترین معاش را دارد؟',
    'چند نفر بیش از ۳ روز غایب بودند؟',
    'سه کارمند با بیشترین معاش را نشان بده.',
  ],
}

export function NLQueryPanel({ periodId, locale }: Props) {
  const isRTL = locale !== 'en'
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [pending, startTransition] = useTransition()

  function submit(question: string) {
    if (!question.trim() || pending) return
    const q = question.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: q }])
    startTransition(async () => {
      try {
        const { answer, latencyMs } = await nlQuery(q, periodId)
        setMessages(prev => [...prev, { role: 'assistant', text: answer, latencyMs }])
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error'
        setMessages(prev => [...prev, { role: 'assistant', text: `⚠️ ${msg}` }])
      }
    })
  }

  const suggestions = SUGGESTIONS[locale === 'en' ? 'en' : 'dari']

  return (
    <div className="flex flex-col gap-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Suggestion chips */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => submit(s)}
              className="text-xs px-3 py-1.5 rounded-full border bg-muted hover:bg-accent transition-colors text-start"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="space-y-3 max-h-80 overflow-y-auto rounded-lg border bg-muted/20 p-3">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex gap-2', m.role === 'user' && 'flex-row-reverse')}>
              <div className={cn(
                'h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border',
              )}>
                {m.role === 'user'
                  ? <User className="h-3.5 w-3.5" />
                  : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div className={cn(
                'rounded-lg px-3 py-2 text-sm max-w-[85%]',
                m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border',
              )}>
                <p className="whitespace-pre-wrap">{m.text}</p>
                {m.latencyMs && (
                  <p className="text-[10px] opacity-50 mt-1">{m.latencyMs}ms</p>
                )}
              </div>
            </div>
          ))}
          {pending && (
            <div className="flex gap-2">
              <div className="h-6 w-6 rounded-full bg-muted border flex items-center justify-center shrink-0">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-lg border bg-background px-3 py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(input) }
          }}
          placeholder={locale === 'en'
            ? 'Ask about labor costs, attendance, payroll…'
            : 'سوال درباره هزینه کار، حضور، معاش…'}
          rows={2}
          disabled={pending}
          className="resize-none flex-1"
        />
        <Button
          size="icon"
          onClick={() => submit(input)}
          disabled={pending || !input.trim()}
          className="h-10 w-10 shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
