import type React from "react"
import type { Metadata } from "next"
// We are no longer importing a specific font here, as we'll load them directly.
import "./globals.css"

export const metadata: Metadata = {
  title: "KrishiSevak - Your Personal Farming Advisor",
  description:
    "AI-powered agricultural assistant supporting multiple Indian languages. Get expert farming advice, crop analysis, and agricultural guidance.",
  keywords: "agriculture, farming, AI assistant, crop advice, digital agriculture, krishi, farming advisor, mobile farming app",
  authors: [{ name: "Digital Agriculture Team" }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
  },
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KrishiSevak'
  },
  formatDetection: {
    telephone: false
  },
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* --- ADD THESE THREE LINES --- */}
        {/* This directly loads the best fonts for English, Kannada, and Malayalam from Google Fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&family=Noto+Sans+Kannada:wght@400;500;700&family=Noto+Sans+Malayalam:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      {/* We remove the specific font class from the body so our CSS can handle it. */}
      <body>{children}</body>
    </html>
  )
}