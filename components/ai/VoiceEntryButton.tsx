'use client'

import { useState, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ParsedEntry {
  work_code: string
  quantity: number
  notes: string | null
  confidence: number
}

interface Props {
  workCodes: { code: string; description: string; unitPrice: number }[]
  locale: string
  onParsed: (entry: ParsedEntry) => void
}

const LANG_MAP: Record<string, string> = {
  en: 'en-US',
  dari: 'fa-AF',
  pashto: 'ps-AF',
}

type RecognitionState = 'idle' | 'listening' | 'processing' | 'error'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any

function getSpeechRecognitionCtor(): AnySpeechRecognition | null {
  if (typeof window === 'undefined') return null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function VoiceEntryButton({ workCodes, locale, onParsed }: Props) {
  const [recState, setRecState] = useState<RecognitionState>('idle')
  const [transcript, setTranscript] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recRef = useRef<any>(null)

  const Ctor = getSpeechRecognitionCtor()
  if (!Ctor) return null

  function start() {
    if (recState !== 'idle') return
    setRecState('listening')
    setTranscript('')

    const rec = new Ctor()
    rec.lang = LANG_MAP[locale] ?? 'fa-AF'
    rec.interimResults = false
    rec.maxAlternatives = 1
    recRef.current = rec

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = async (e: any) => {
      const text: string = e.results[0]?.[0]?.transcript ?? ''
      setTranscript(text)
      setRecState('processing')
      try {
        const res = await fetch('/api/ai/voice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: text, workCodes, locale }),
        })
        if (!res.ok) throw new Error('parse failed')
        const parsed = await res.json() as ParsedEntry
        onParsed(parsed)
        setRecState('idle')
      } catch {
        setRecState('error')
        setTimeout(() => setRecState('idle'), 2000)
      }
    }

    rec.onerror = () => {
      setRecState('error')
      setTimeout(() => setRecState('idle'), 2000)
    }

    rec.onend = () => {
      setRecState(prev => prev === 'listening' ? 'idle' : prev)
    }

    rec.start()
  }

  function stop() {
    recRef.current?.stop()
    setRecState('idle')
  }

  const isListening = recState === 'listening'
  const isProcessing = recState === 'processing'

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="icon"
        variant={isListening ? 'destructive' : 'outline'}
        onClick={isListening ? stop : start}
        disabled={isProcessing}
        className={cn('h-9 w-9 shrink-0', isListening && 'animate-pulse')}
        title={isListening ? 'Stop recording' : 'Start voice entry'}
      >
        {isProcessing
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : isListening
            ? <MicOff className="h-4 w-4" />
            : <Mic className="h-4 w-4" />}
      </Button>
      {transcript && (
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{transcript}</p>
      )}
    </div>
  )
}
