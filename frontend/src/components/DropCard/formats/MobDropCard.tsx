import { useEffect, useState } from "react";
import { MobDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { BaseDropInfo } from "./BaseDropInfo";
import { Mob } from "../../../models/Mob";
import { fetchMob } from "../../../util/WorldApi";

interface MobDropCardProps {
    drop: MobDrop
}

export function MobDropCard({ drop }: MobDropCardProps) {
    const [mob, setMob] = useState<Mob | undefined>(undefined)

    useEffect(() => {
        setMob(undefined)
        fetchMob(drop.mobId).then((mob) => setMob(mob))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>Drops from: <br /> {mob?.name}</span>
        </div>
    )
}