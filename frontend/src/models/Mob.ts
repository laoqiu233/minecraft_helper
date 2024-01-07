import { Biome } from "./Biome"
import { Structure } from "./Structure"


export type Mob = {
    id: number
    name: string
    image: string
    hp: number
    playerRelation: number
    biomes: Biome[]
    structures: Structure[]
}