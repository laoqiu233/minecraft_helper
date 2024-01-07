import { FishingDrop } from "../../../models/Drop"
import { BaseDropInfo } from "./BaseDropInfo"

interface FishingDropCardProps {
    drop: FishingDrop
}

export function FishingDropCard({ drop }: FishingDropCardProps) {
    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>Might be found while fishing</span>
        </div>
    )
}