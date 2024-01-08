import { GiftDrop } from "../../../models/Drop"
import { BaseDropInfo } from "./BaseDropInfo"

interface GiftDropCardProps {
    drop: GiftDrop
}

export function GiftDropCard({ drop }: GiftDropCardProps) {
    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span><b>Gift source:</b> <br /> {drop.giftSource}</span>
        </div>
    )
}