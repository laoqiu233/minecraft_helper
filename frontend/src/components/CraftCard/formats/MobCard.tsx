import { useEffect, useState } from "react"
import { Mob } from "../../../models/Mob"
import { fetchMob } from "../../../util/WorldApi"
import { useAppDispatch, useAppSelector } from "../../../app/hooks"
import { CraftNode } from "../../../features/craftsBoard/craftsBoardSlice"

interface MobCardProps {
    craftNodeId: number
}

export function MobCard({ craftNodeId }: MobCardProps) {
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
                    <span>name: {mob.name}</span><br />
                    <span>hp: {mob.hp}</span><br />
                    <span>hostility: {mob.playerRelation}</span><br />
                    <span>biomes: {mob.biomes.map((biome) => biome.name  + ", ")}</span><br />
                    <span>structures: {mob.structures.map((structure) => structure.name + ", ")}</span>
                </div>
            </div>
            }
        </div>
    )
}