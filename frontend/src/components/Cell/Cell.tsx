import { useEffect, useState } from "react"
import styles from "./Cell.module.css"
import { Tooltip } from "../Tooltip/Tooltip"

interface cellProps {
  items: Item[]
  amount: number
  itemClickCallBack?: (itemId: number) => void
}

export function Cell({ items, amount, itemClickCallBack }: cellProps) {
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
      <div className={styles.invslot + (itemClickCallBack ? " clickable" : "")} onClick={() => {itemClickCallBack?.(items[itemCounter].id)}} >
        {items[itemCounter] && (
          <img
            className={styles.invslotItemImage + ' sharp-image'}
            src={"images" + items[itemCounter].image}
            alt={items[itemCounter].name}
          />
        )}
        {amount > 1 && <span className={styles.invslotItemCount}>{amount}</span>}
      </div>
    </Tooltip>
  )
}
