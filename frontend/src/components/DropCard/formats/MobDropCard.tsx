import { useEffect, useState } from "react";
import { MobDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { BaseDropInfo } from "./BaseDropInfo";
import { Mob } from "../../../models/Mob";
import { fetchMob } from "../../../util/WorldApi";
import { NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice";

interface MobDropCardProps {
    drop: MobDrop
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function MobDropCard({ drop, worldEntityClickCallBack }: MobDropCardProps) {
    const [mob, setMob] = useState<Mob | undefined>(undefined)

    useEffect(() => {
        setMob(undefined)
        fetchMob(drop.mobId).then((mob) => setMob(mob))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span><b>Drops from:</b> <br /></span>
            {mob && <a className="clickable" onClick={() => worldEntityClickCallBack(mob.id, "mob")}>{mob.name}</a>}
        </div>
    )
}