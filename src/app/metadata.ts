import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL('https://devflow.ca'),
  title: {
    default: "DevFlow - Custom Software Development Solutions",
    template: "%s | DevFlow"
  },
  description: "Expert software development services including web development, mobile apps, API integration, and enterprise solutions. Vancouver-based custom software development company.",
  keywords: ["software development", "web development", "mobile apps", "API integration", "enterprise solutions", "Vancouver software company", "custom software", "DevFlow", "tech solutions", "digital transformation"],
  authors: [{ name: "DevFlow" }],
  creator: "DevFlow",
  publisher: "DevFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: 'https://devflow.ca',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/DevLogo.png',
    apple: '/DevLogo.png',
  },
  openGraph: {
    title: 'DevFlow - Custom Software Development Solutions',
    description: 'Expert software development services including web development, mobile apps, API integration, and enterprise solutions.',
    url: 'https://devflow.ca',
    siteName: 'DevFlow',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DevFlow - Custom Software Development',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevFlow - Custom Software Development Solutions',
    description: 'Expert software development services including web development, mobile apps, API integration, and enterprise solutions.',
    images: ['/og-image.jpg'],
    creator: '@devflow',
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
  },
  category: 'technology',
  classification: 'Software Development',
}; 