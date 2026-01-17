import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

/* ================================
   SEO + META CONFIG
================================ */
export const metadata: Metadata = {
  metadataBase: new URL("https://expensio-tracker-web.netlify.app"),

  title: {
    default: "Expensio – Expense Tracker Web App",
    template: "%s | Expensio",
  },

  description:
    "Expensio is a modern expense tracker web app to manage your finances, track spending, export PDFs, and sign in securely with Google OAuth.",

  keywords: [
    "Expense Tracker",
    "Finance Manager",
    "Budget App",
    "Money Tracker",
    "Personal Finance",
    "Expensio",
    "Expense Tracker Web App",
  ],

  authors: [{ name: "Expensio Team" }],
  creator: "Expensio",
  publisher: "Expensio",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.svg",
        color: "#22c55e",
      },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://expensio-tracker-web.netlify.app",
    siteName: "Expensio",
    title: "Expensio – Expense Tracker Web App",
    description:
      "Track expenses, manage budgets, export reports, and control your finances with Expensio.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Expensio Expense Tracker",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Expensio – Expense Tracker Web App",
    description:
      "A modern expense tracker to manage your finances and budgets with ease.",
    images: ["/logo.png"],
  },

  category: "Finance",
}

/* ================================
   VIEWPORT / PWA
================================ */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#16a34a",
}

/* ================================
   ROOT LAYOUT
================================ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased bg-gray-900 text-white`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
