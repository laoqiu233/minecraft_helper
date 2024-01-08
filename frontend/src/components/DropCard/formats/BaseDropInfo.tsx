import { useEffect, useState } from "react";
import { AbstractDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { Cell } from "../../Cell/Cell";

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
            {resultItem && <Cell items={[resultItem]} amount={1}/>}
            <br />
            <br />
            <span><b>Drop probability:</b> {drop.probability}</span>
            <br />
            <span><b>Drop amount:</b> {drop.amount}</span>
        </div>
        
    )
}