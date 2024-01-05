import { useEffect, useState } from "react"
import styles from "./Cell.module.css"

interface cellProps {
  items: Item[],
  amount: number
}

export function Cell({ items, amount }: cellProps) {
  const [itemCounter, setItemCounter] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (items.length > 0) {
        setItemCounter((x) => (x + 1) % items.length)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={styles.invslot}>
      {items[itemCounter] ? (
        <img
          className={styles.invslotItemImage}
          src={"images" + items[itemCounter].image}
          alt={items[itemCounter].name}
        />
      ) : (
        ""
      )}
      {
       amount > 0 && <span className={styles.invslotItemCount}>{amount}</span>
      }
    </div>
  )
}
