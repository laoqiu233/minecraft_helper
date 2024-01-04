import { useEffect, useState } from "react"
import { fetchAllItems } from "../util/RecipeApi"
import { Cell } from "./Cell";

function createArrayOfArrays<T>(flatArray: T[], subarrayLength: number): T[][] {
    return Array.from({ length: Math.ceil(flatArray.length / subarrayLength) }, (_, index) =>
      flatArray.slice(index * subarrayLength, (index + 1) * subarrayLength)
    );
}

export function AllItems() {
    const tableWidth = 5;
    const [items, setItems] = useState<Item[]>([])

    useEffect(() => {
        fetchAllItems().then((items) => setItems(items))
    }, [])

    let tmpItems = createArrayOfArrays<Item>(items, tableWidth)
    let itemsUI = tmpItems.map((items) => {
        return <div>
            {
                items.map((item) => {
                    return <Cell items={[item]}/>
                })
            }
        </div>
    })

    return (
        <div>
            {itemsUI}
        </div>
    )
}