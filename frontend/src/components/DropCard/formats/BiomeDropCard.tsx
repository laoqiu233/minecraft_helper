import { useEffect, useState } from "react";
import { BiomeDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { BaseDropInfo } from "./BaseDropInfo";
import { Biome } from "../../../models/Biome";
import { fetchBiome } from "../../../util/WorldApi";
import { NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice";

interface BiomeDropCardProps {
    drop: BiomeDrop
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function BiomeDropCard({ drop, worldEntityClickCallBack }: BiomeDropCardProps) {
    const [biome, setbiome] = useState<Biome | undefined>(undefined)

    useEffect(() => {
        setbiome(undefined)
        fetchBiome(drop.biomeId).then((biome) => setbiome(biome))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>
                <b>Drops in:</b> <br />
                {biome && <a className="clickable" onClick={() => worldEntityClickCallBack(biome.id, "biome")}>{biome.name}</a>}
            </span>
        </div>
    )
}