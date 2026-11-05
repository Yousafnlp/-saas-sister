import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'd.Aesthetics Clinic Manager',
    short_name: 'd.Aesthetics',
    description: 'Appointments, clients, billing and team management for your clinic.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#ffffff',
    theme_color: '#005a5f',
    categories: ['business', 'medical', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Appointments', url: '/appointments', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Clients', url: '/clients', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
