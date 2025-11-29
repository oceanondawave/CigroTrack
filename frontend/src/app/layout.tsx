import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { GradientAnimator } from "@/components/gradient-animator"
import { AuthProvider } from "@/features/auth/contexts/auth-context"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
})
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Issue Tracker",
  description: "AI-powered issue tracking application",
  generator: "v0.app",
  icons: {
    icon: "/icon.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                'use strict';
                try {
                  const random = (min, max) => Math.random() * (max - min) + min;
                  const root = document.documentElement;
                  
                  // Generate random rotation values with larger ranges
                  const rotate1 = random(-15, 15);
                  const rotate2 = random(-12, 12);
                  const rotate3 = random(-8, 8);
                  const rotate5 = random(-15, 15);
                  const rotate6 = random(-12, 12);
                  const rotate7 = random(-8, 8);
                  
                  // Random hue rotation values with larger ranges
                  const hue1 = random(-70, 70);
                  const hue2 = random(-60, 60);
                  const hue3 = random(-40, 40);
                  const hue5 = random(-70, 70);
                  const hue6 = random(-60, 60);
                  const hue7 = random(-40, 40);
                  
                  // Set CSS variables on :root immediately
                  root.style.setProperty('--rotate-1', rotate1.toFixed(2) + 'deg');
                  root.style.setProperty('--rotate-2', rotate2.toFixed(2) + 'deg');
                  root.style.setProperty('--rotate-3', rotate3.toFixed(2) + 'deg');
                  root.style.setProperty('--rotate-5', rotate5.toFixed(2) + 'deg');
                  root.style.setProperty('--rotate-6', rotate6.toFixed(2) + 'deg');
                  root.style.setProperty('--rotate-7', rotate7.toFixed(2) + 'deg');
                  
                  root.style.setProperty('--hue-1', hue1.toFixed(2) + 'deg');
                  root.style.setProperty('--hue-2', hue2.toFixed(2) + 'deg');
                  root.style.setProperty('--hue-3', hue3.toFixed(2) + 'deg');
                  root.style.setProperty('--hue-5', hue5.toFixed(2) + 'deg');
                  root.style.setProperty('--hue-6', hue6.toFixed(2) + 'deg');
                  root.style.setProperty('--hue-7', hue7.toFixed(2) + 'deg');
                } catch(e) {
                  console.error('Gradient randomizer error:', e);
                }
              })();
            `,
          }}
        />
        <GradientAnimator />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
