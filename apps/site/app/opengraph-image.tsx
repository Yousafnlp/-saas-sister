import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

export const alt = `${site.name}: ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          padding: 72,
          background: 'linear-gradient(135deg, #00393c 0%, #005a5f 60%, #0b6f73 100%)',
          color: '#f2fbfa',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#f2fbfa" />
            <rect x="13" y="7" width="6" height="18" rx="3" fill="#005a5f" />
            <rect x="7" y="13" width="18" height="6" rx="3" fill="#005a5f" />
            <circle cx="25" cy="7" r="2.5" fill="#f7c6ae" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700 }}>{site.name}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <span style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Every patient, from first message to final invoice.
          </span>
          <span style={{ fontSize: 30, color: '#a9cfcc' }}>{site.title}</span>
        </div>
      </div>
    ),
    size,
  );
}
