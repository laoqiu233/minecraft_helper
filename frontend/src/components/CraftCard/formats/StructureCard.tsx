import { useEffect, useState } from "react"
import { Structure } from "../../../models/Structure"
import { fetchStructure } from "../../../util/WorldApi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { CraftNode, NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice"

interface StructureProps {
    craftNodeId: number
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function StructureCard({ craftNodeId, worldEntityClickCallBack }: StructureProps) {
    const [structure, setStructure] = useState<Structure | undefined>(undefined)

    const dispatch = useAppDispatch()

    const craftNode: CraftNode = useAppSelector(
      (state) => state.craftBoard.craftNodes[craftNodeId],
    )

    useEffect(() => {
        setStructure(undefined)
        fetchStructure(craftNode.targetId).then((structure) => setStructure(structure))
    }, [craftNodeId])

    return (
        <div className="minecraft-card">
            {structure && 
            <div>
                <div><img src={structure.image} alt="" /></div>
                <div>
                    <span><b>name:</b> {structure.name}</span><br />
                    <span><b>description:</b> {structure.description}</span><br />
                    <span>
                        <b>biomes:</b> <br />
                        {structure.biomes.map((biome, index) => {
                            return (
                                <a className="clickable" onClick={() => worldEntityClickCallBack(biome.id, "biome")}>
                                    {biome.name}{index != structure.biomes.length - 1 ? ", " : ""}
                                </a>
                            )
                        })}
                    </span><br />
                </div>
            </div>
            }
        </div>
    )
}