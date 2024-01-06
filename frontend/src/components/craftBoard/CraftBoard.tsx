import { CraftCard } from "../CraftCard/CraftCard"
import styles from "./CraftBoard.module.css"
import { useAppSelector } from "../../app/hooks"
import { useEffect, useRef, useState } from "react"
export function CraftBoard() {
  const hasNodes = useAppSelector(state => 0 in state.craftBoard.craftNodes)
  const boardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [centerX, setCenterX] = useState(0);
  const [centerY, setCenterY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const resetCenter = () => {
    const board = boardRef.current
    const content = contentRef.current

    if (board && content) {
      const boardRect = board.getBoundingClientRect()
      const contentRect = content.getBoundingClientRect();
      setCenterX(Math.round(boardRect.width / 2 - contentRect.width / 2));
      setCenterY(Math.round(boardRect.height / 2 - contentRect.height / 2));
    }
  }

  useEffect(() => {
    if (boardRef.current && contentRef.current) {
      const observer = new ResizeObserver(resetCenter)
      observer.observe(boardRef.current);
      observer.observe(contentRef.current);
    }
  }, [])

  useEffect(() => {
    setOffsetX(0)
    setOffsetY(0)
  }, [hasNodes])

  return (
    <div 
      className={styles.board}
      ref={boardRef}
      onMouseMove={(e) => {
        if ((e.buttons & 1) === 1) {
          setOffsetX(x => x + e.movementX)
          setOffsetY(y => y + e.movementY)
        }
      }}
      onWheel={(e) => {
        setOffsetX(x => x - e.deltaX)
        setOffsetY(y => y - e.deltaY)
      }}
    >
      <div className={styles.boardContent} ref={contentRef} style={{left: centerX + offsetX, top: centerY + offsetY}}>
        {hasNodes && <CraftCard craftNodeId={0}/>}
      </div>
    </div>
  )
}
