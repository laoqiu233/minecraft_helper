import { useEffect, useState } from "react"
import styles from "./Cell.module.css"
import { Tooltip } from "../Tooltip/Tooltip"
import { NodeTargetType } from "../../features/craftsBoard/craftsBoardSlice"

interface cellProps {
  items: Item[]
  amount: number
  worldEntityClickCallBack?: (targetId: number, targetType: NodeTargetType) => void
}

export function Cell({ items, amount, worldEntityClickCallBack }: cellProps) {
  const [itemCounter, setItemCounter] = useState(0)

  useEffect(() => {
    setItemCounter(0)
    const interval = setInterval(() => {
      if (items.length > 0) {
        setItemCounter((x) => (x + 1) % items.length)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [items.length])



  return (
    <Tooltip tip={items[itemCounter]?.name}>
      <div className={styles.invslot + (worldEntityClickCallBack ? " clickable" : "")} onClick={() => {worldEntityClickCallBack?.(items[itemCounter].id, "item")}} >
        {items[itemCounter] && (
          <img
            className={styles.invslotItemImage + ' sharp-image'}
            src={"images" + items[itemCounter].image}
            alt={items[itemCounter].name}
            onError={(e) => {
              // @ts-ignore
              e.target.onerror = null
              // @ts-ignore
              e.target.src = '/images/barrier.png'
            }}
          />
        )}
        {amount > 1 && <span className={styles.invslotItemCount}>{amount}</span>}
      </div>
    </Tooltip>
  )
}
