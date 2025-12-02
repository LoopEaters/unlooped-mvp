import type { Metadata } from 'next'
import './globals.css'
import { Inter, Noto_Sans_KR } from 'next/font/google'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import { ToastProvider } from './providers/ToastProvider'
import { EntityFilterProvider } from './providers/EntityFilterProvider'
import { AIUpdateProvider } from './providers/AIUpdateProvider'
import LoginModal from './components/auth/LoginModal'

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

export const metadata: Metadata = {
  title: 'Unlooped MVP',
  description: 'Unlooped MVP Project',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoSansKr.variable}`} suppressHydrationWarning>
      <body className="font-sans">
        <AuthProvider>
          <QueryProvider>
            <EntityFilterProvider>
              <AIUpdateProvider>
                <ToastProvider />
                {children}
                <LoginModal />
              </AIUpdateProvider>
            </EntityFilterProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
