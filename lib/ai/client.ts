import Anthropic from '@anthropic-ai/sdk'

let _client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return _client
}

export const MODELS = {
  fast:  'claude-haiku-4-5-20251001',   // NL queries, anomaly review
  voice: 'claude-haiku-4-5-20251001',   // voice transcript parsing
} as const
