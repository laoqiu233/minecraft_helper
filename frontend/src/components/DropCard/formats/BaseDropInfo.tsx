import { useEffect, useState } from "react";
import { AbstractDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { Cell } from "../../Cell/Cell";
import styles from "../DropCard.module.css"

interface BaseDropInfoProps {
    drop: AbstractDrop
}

export function BaseDropInfo({ drop }: BaseDropInfoProps) {

    const [resultItem, setResultItem] = useState<Item | undefined>(undefined)

    useEffect(() => {
        fetchItem(drop.itemId).then((item) => {setResultItem(item)})
    }, [])

    return (
        <div>
            <div className={styles.dropCardHeader}>
                {resultItem && <Cell items={[resultItem]} amount={1}/>}
                <span> <b>{resultItem?.name}</b></span>
            </div>
            <span><b>Drop probability:</b> {drop.probability}</span>
            <br />
            <span><b>Drop amount:</b> {drop.amount}</span>
        </div>
        
    )
}