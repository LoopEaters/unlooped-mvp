import type { Metadata } from 'next'
import './globals.css'
import 'tippy.js/dist/tippy.css'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import localFont from 'next/font/local'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ToastProvider } from './providers/ToastProvider'
import { EntityFilterProvider } from './providers/EntityFilterProvider'
import { AIUpdateProvider } from './providers/AIUpdateProvider'
import { SettingsProvider } from './providers/SettingsProvider'
import LoginModal from './components/auth/LoginModal'
import FontSettingsApplier from './components/common/FontSettingsApplier'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
})

const sweet = localFont({
  src: './fonts/SUITE-Light.woff2',
  variable: '--font-sweet',
  weight: '300',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Unlooped MVP',
  description: 'Unlooped MVP Project',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansKr.variable} ${sweet.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <QueryProvider>
            <SettingsProvider>
              <FontSettingsApplier />
              <EntityFilterProvider>
                <AIUpdateProvider>
                  <ToastProvider />
                  {children}
                  <LoginModal />
                </AIUpdateProvider>
              </EntityFilterProvider>
            </SettingsProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
