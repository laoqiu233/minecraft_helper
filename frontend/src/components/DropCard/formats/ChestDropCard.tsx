import { useEffect, useState } from "react";
import { ChestDrop } from "../../../models/Drop";
import { BaseDropInfo } from "./BaseDropInfo";
import { Structure } from "../../../models/Structure";
import { fetchStructure } from "../../../util/WorldApi";
import { NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice";

interface ChestDropCardProps {
    drop: ChestDrop
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function ChestDropCard({ drop, worldEntityClickCallBack }: ChestDropCardProps) {
    const [structure, setStructure] = useState<Structure | undefined>(undefined)

    useEffect(() => {
        setStructure(undefined)
        fetchStructure(drop.structureId).then((structure) => setStructure(structure))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>
                <b>Spawn in chest in:</b> <br /> 
                {structure && <a className="clickable" onClick={() => worldEntityClickCallBack(structure.id, "structure")}>{structure.name}</a>}
            </span>
        </div>
    )
}