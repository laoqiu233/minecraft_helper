import { Biome } from "./Biome"

export type Structure = {
    id: number
    name: string
    image: string
    description: string
    biomes: Biome[]
}