import { useEffect, useState } from "react"
import styles from "./Cell.module.css"

interface CellProps {
  items: Item[]
}

export function Cell({ items }: CellProps) {
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
          width="32"
          height="32"
        />
      ) : (
        ""
      )}
    </div>
  )
}
