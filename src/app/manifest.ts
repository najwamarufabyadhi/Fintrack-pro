import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FinTrack Pro – Multi-Account Financial Engine',
    short_name: 'FinTrack',
    description: 'Enterprise-grade personal and multi-account financial tracking engine',
    start_url: '/',
    display: 'standalone',
    background_color: '#0F172A',
    theme_color: '#4F46E5',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
