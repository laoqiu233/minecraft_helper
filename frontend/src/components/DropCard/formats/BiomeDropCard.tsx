import { useEffect, useState } from "react";
import { BiomeDrop } from "../../../models/Drop";
import { fetchItem } from "../../../util/RecipeApi";
import { BaseDropInfo } from "./BaseDropInfo";
import { Biome } from "../../../models/Biome";
import { fetchBiome } from "../../../util/WorldApi";

interface BiomeDropCardProps {
    drop: BiomeDrop
}

export function BiomeDropCard({ drop }: BiomeDropCardProps) {
    const [biome, setbiome] = useState<Biome | undefined>(undefined)

    useEffect(() => {
        setbiome(undefined)
        fetchBiome(drop.biomeId).then((biome) => setbiome(biome))
    }, [drop])

    return (
        <div>
            <BaseDropInfo drop={drop}/>
            <span>Drops in: <br /> {biome?.name}</span>
        </div>
    )
}