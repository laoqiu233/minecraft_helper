import { useState } from "react"
import styles from "./Tooltip.module.css"

interface TooltipProps {
  children: React.ReactNode
  tip?: string
}

export function Tooltip({ children, tip }: TooltipProps) {
  const [mouseX, setMouseX] = useState(0)
  const [mouseY, setMouseY] = useState(0)
  const [showToolTip, setShowToolTip] = useState(false)

  return (
    <div
        className={styles.tooltipWrapper}
        onMouseMove={(e) => {
            setMouseX(e.clientX)
            setMouseY(e.clientY)
        }}
        onMouseEnter={() => setShowToolTip(true)}
        onMouseLeave={() => setShowToolTip(false)}
    >
        {children}
        {showToolTip && tip && <div 
          className={styles.tooltip}
          style={{left: `${mouseX + 10}px`, top: `${mouseY - 40}px`}}
        >
          {tip}
        </div>}
    </div>
  )
}
