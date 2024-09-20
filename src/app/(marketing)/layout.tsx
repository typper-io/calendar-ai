import { ThemeProvider } from '@/components/theme-provider'
import '../globals.css'
import { Footer } from '@/components/footer'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main>
      <ThemeProvider attribute="class" forcedTheme="light">
        {children}
        <Footer />
      </ThemeProvider>
    </main>
  )
}
