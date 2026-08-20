'use client'

import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Accordion = AccordionPrimitive.Root

export function AccordionItem({
  value,
  question,
  children,
  tone = 'light',
}: {
  value: string
  question: string
  children: React.ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn('border-b', tone === 'light' ? 'border-soft-gray' : 'border-white/12')}
    >
      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            'group flex flex-1 items-start justify-between gap-6 py-5 text-left text-subheading transition-colors duration-fast',
            tone === 'light'
              ? 'text-navy hover:text-violet-600'
              : 'text-white hover:text-lime',
          )}
        >
          {question}
          <Plus
            aria-hidden="true"
            className={cn(
              'mt-0.5 h-5 w-5 shrink-0 transition-transform duration-base ease-entrance group-data-[state=open]:rotate-45',
              tone === 'light' ? 'text-slate' : 'text-muted-dark',
            )}
          />
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div
          className={cn(
            'max-w-measure pb-6 pr-10 text-body',
            tone === 'light' ? 'text-slate-strong' : 'text-muted-dark',
          )}
        >
          {children}
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  )
}
