import { FloatingDock } from '@/components/ui/floating-dock'
import { ReactNode } from 'react'

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full flex flex-col overflow-hidden">
      {children}

      <FloatingDock />
    </div>
  )
}
