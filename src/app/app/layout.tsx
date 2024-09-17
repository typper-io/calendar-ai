import { FloatingDock } from '@/components/ui/floating-dock'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full flex flex-col overflow-hidden">
      {children}

      <div className="fixed bottom-0 left-0 right-0 z-10 w-full sm:w-fit sm:absolute sm:bottom-10 sm:left-1/2 sm:-translate-x-1/2">
        <FloatingDock />
      </div>
    </div>
  )
}
