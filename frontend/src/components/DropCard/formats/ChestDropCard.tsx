import { useEffect, useState } from "react";
import { ChestDrop } from "../../../models/Drop";
import { BaseDropInfo } from "./BaseDropInfo";
import { Structure } from "../../../models/Structure";
import { fetchStructure } from "../../../util/WorldApi";

interface ChestDropCardProps {
    drop: ChestDrop
}

export function ChestDropCard({ drop }: ChestDropCardProps) {
    const [structure, setStructure] = useState<Structure | undefined>(undefined)

    useEffect(() => {
        setStructure(undefined)
        fetchStructure(drop.structureId).then((structure) => setStructure(structure))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>Spawn in chest in: <br /> {structure?.name}</span>
        </div>
    )
}