import { useEffect, useState } from "react"
import { Mob } from "../../../models/Mob"
import { fetchMob } from "../../../util/WorldApi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { CraftNode, NodeTargetType } from "../../../features/craftsBoard/craftsBoardSlice"

interface MobCardProps {
    craftNodeId: number
    worldEntityClickCallBack: (targetId: number, targetType: NodeTargetType) => void
}

export function MobCard({ craftNodeId, worldEntityClickCallBack }: MobCardProps) {
    const [mob, setMob] = useState<Mob | undefined>(undefined)

    const dispatch = useAppDispatch()

    const craftNode: CraftNode = useAppSelector(
      (state) => state.craftBoard.craftNodes[craftNodeId],
    )

    useEffect(() => {
        setMob(undefined)
        fetchMob(craftNode.targetId).then((mob) => setMob(mob))
    }, [craftNodeId])

    return (
        <div className="minecraft-card">
            {mob && 
            <div>
                <div><img src={mob.image} alt="" /></div>
                <div>
                    <span><b>name:</b> {mob.name}</span><br />
                    <span><b>hp:</b> {mob.hp}</span><br />
                    <span><b>hostility:</b> {mob.playerRelation}</span><br />
                    <span>
                        <b>biomes:</b> <br />
                        {mob.biomes.map((biome, index) => {
                            return (
                                <a className="clickable" onClick={() => worldEntityClickCallBack(biome.id, "biome")}>
                                    {biome.name}{index != mob.biomes.length - 1 ? ", " : ""}
                                </a>
                            )
                        })}
                    </span><br />
                    <span>
                        <b>structures:</b> <br />
                        {mob.structures.map((structure, index) => {
                            return (
                                <a className="clickable" onClick={() => worldEntityClickCallBack(structure.id, "structure")}>
                                    {structure.name}{index != mob.structures.length - 1 ? ", " : ""}
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