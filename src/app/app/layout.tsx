import { FloatingDock } from '@/components/ui/floating-dock'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {children}

      <div className="absolute bottom-10 transform -translate-x-1/2 left-1/2 z-10">
        <FloatingDock />
      </div>
    </div>
  )
}
