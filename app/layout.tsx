import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Yaaré - Marché en ligne du Burkina Faso',
    template: '%s | Yaaré',
  },
  description:
    'Achetez et vendez facilement au Burkina Faso. Véhicules, téléphones, immobilier, mode et plus encore. Rejoignez Yaaré, le marché en ligne burkinabè.',
  keywords: [
    'marché en ligne',
    'Burkina Faso',
    'vente',
    'achat',
    'petites annonces',
    'Ouagadougou',
    'Bobo-Dioulasso',
  ],
  authors: [{ name: 'Yaaré' }],
  creator: 'Yaaré',
  openGraph: {
    type: 'website',
    locale: 'fr_BF',
    url: '/',
    siteName: 'Yaaré',
    title: 'Yaaré - Marché en ligne du Burkina Faso',
    description: 'Achetez et vendez facilement au Burkina Faso.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Yaaré - Marché en ligne',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Yaaré - Marché en ligne du Burkina Faso',
    description: 'Achetez et vendez facilement au Burkina Faso.',
    images: ['/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yaaré',
  },
  formatDetection: {
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#009B4D',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${poppins.variable} ${inter.variable}`}>
      <head>
        <link rel="icon" href="/icons/favicon.png" type="image/png" />
        <link rel="icon" href="/icons/favicon.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1F2937',
              color: '#F9FAFB',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#009B4D',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF2B2D',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
