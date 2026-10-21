"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

/**
 * Fades + slides children in the first time they scroll into view.
 * Styles live in app/globals.css (`.bis-reveal`) and respect prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const style: CSSProperties = { transitionDelay: `${delay}ms` }
  return (
    <div ref={ref} style={style} className={`bis-reveal ${shown ? "is-in" : ""} ${className}`}>
      {children}
    </div>
  )
}
