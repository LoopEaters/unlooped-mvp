import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './providers/AuthProvider'
import LoginModal from './components/auth/LoginModal'

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <QueryProvider>
            {children}
            <LoginModal />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
