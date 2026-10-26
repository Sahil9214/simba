import { useState, useEffect } from 'react'

const DEFAULT_BREAKPOINT = 768

export const useMobile = (breakpoint = DEFAULT_BREAKPOINT) => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < breakpoint)
    checkMobile()
    
    // Debounce resize events
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [breakpoint])

  return isMobile;
}