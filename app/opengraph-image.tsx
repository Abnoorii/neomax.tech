import { ImageResponse } from 'next/og'
import { site } from '@/content/site'

export const runtime = 'nodejs'
export const alt = `${site.legalName} — growth engineered for ambitious companies`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Social card. Generated rather than shipped as a bitmap so it always matches
 * the current positioning line, and drawn with system fonts so the build needs
 * no font fetch.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#080B12',
          padding: '72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#7657FF',
              display: 'flex',
            }}
          />
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.04em',
            }}
          >
            NEOMAX
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#FFFFFF',
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
              maxWidth: 940,
            }}
          >
            We don’t just market your business.
          </div>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: '#B7F34A',
              lineHeight: 1.05,
              letterSpacing: '-0.035em',
            }}
          >
            We engineer its growth.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.14)',
            paddingTop: '28px',
            fontSize: 24,
            color: '#9AA5BC',
          }}
        >
          <div style={{ display: 'flex' }}>
            Performance marketing · Revenue systems · E-commerce growth
          </div>
          <div style={{ display: 'flex' }}>{site.domain}</div>
        </div>
      </div>
    ),
    size,
  )
}
