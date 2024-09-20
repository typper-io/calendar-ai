import { ThemeProvider } from '@/components/theme-provider'
import { FloatingDock } from '@/components/ui/floating-dock'
import { Toaster } from '@/components/ui/sonner'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <Toaster />
      <div className="relative h-dvh w-full flex flex-col overflow-hidden">
        {children}

        <FloatingDock />
      </div>
    </ThemeProvider>
  )
}
