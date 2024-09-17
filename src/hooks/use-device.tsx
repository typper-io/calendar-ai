import { useEffect, useState } from 'react'

export const useDevice = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return { isMobile }
}
