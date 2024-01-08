import { useEffect, useState } from "react"
import { fetchBiome } from "../../../util/WorldApi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { CraftNode, NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice"
import { Biome } from "../../../models/Biome"

interface BiomeCardProps {
    craftNodeId: number
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function BiomeCard({ craftNodeId, worldEntityClickCallBack }: BiomeCardProps) {
    const [biome, setBiome] = useState<Biome | undefined>(undefined)

    const dispatch = useAppDispatch()

    const craftNode: CraftNode = useAppSelector(
      (state) => state.craftBoard.craftNodes[craftNodeId],
    )

    useEffect(() => {
        setBiome(undefined)
        fetchBiome(craftNode.targetId).then((biome) => setBiome(biome))
    }, [craftNodeId])

    return (
        <div className="minecraft-card">
            {biome && 
            <div>
                <div><img src={biome.image} alt="" /></div>
                <div>
                    <span><b>name:</b> {biome.name}</span><br />
                    <span><b>description:</b> {biome.description}</span><br />
                    <span><b>dimension:</b> {biome.dimension.name}</span><br />
                </div>
            </div>
            }
        </div>
    )
}