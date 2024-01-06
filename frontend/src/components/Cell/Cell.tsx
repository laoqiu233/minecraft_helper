import { useEffect, useState } from "react"
import styles from "./Cell.module.css"

interface cellProps {
  items: Item[]
  amount: number
  itemClickCallBack: (targetItemId: number) => void
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
    <div className={styles.invslot} onClick={() => {itemClickCallBack(items[itemCounter].id)}}>
      {items[itemCounter] ? (
        <img
          className={styles.invslotItemImage + ' sharp-image'}
          src={"images" + items[itemCounter].image}
          alt={items[itemCounter].name}
        />
      ) : (
        ""
      )}
      {amount > 1 && <span className={styles.invslotItemCount}>{amount}</span>}
    </div>
  )
}
