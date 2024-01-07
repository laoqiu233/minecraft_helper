import { AbstractDrop, BiomeDrop, ChestDrop, FishingDrop, GiftDrop, MobDrop } from "../../models/Drop";
import { BiomeDropCard } from "./formats/BiomeDropCard";
import { ChestDropCard } from "./formats/ChestDropCard";
import { FishingDropCard } from "./formats/FishingDropCard";
import { GiftDropCard } from "./formats/GiftDropCard";
import { MobDropCard } from "./formats/MobDropCard";

interface DropCardProps {
    drop: AbstractDrop
}


const chooseDropCard = (drop: AbstractDrop) => {
    if (drop.type == "biome") {
        return (<BiomeDropCard drop={drop as BiomeDrop}/>)
    } else if (drop.type == "chest") {
        return (<ChestDropCard drop={drop as ChestDrop}/>)
    } else if (drop.type == "fishing") {
        return (<FishingDropCard drop={drop as FishingDrop}/>)
    } else if (drop.type == "gift") {
        return (<GiftDropCard drop={drop as GiftDrop}/>)
    } else if (drop.type == "mob") {
        return (<MobDropCard drop={drop as MobDrop}/>)
    }
}

export function DropCard({ drop }: DropCardProps) {
    return (
        <div>
            {chooseDropCard(drop)}
        </div>
    )
}