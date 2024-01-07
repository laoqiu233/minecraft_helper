import apiClient from "../API"
import { Biome } from "../models/Biome"
import { Mob } from "../models/Mob"
import { Structure } from "../models/Structure"

export async function fetchMob(mobId: number): Promise<Mob> {
    let res = await apiClient.get(`/world/mobs/${mobId}`)
    let result: Mob = res.data
    return result
}


export async function fetchStructure(structureId: number): Promise<Structure> {
    let res = await apiClient.get(`/world/structures/${structureId}`)
    let result: Structure = res.data
    return result
}

export async function fetchBiome(biomeId: number): Promise<Biome> {
    let res = await apiClient.get(`/world/biomes/${biomeId}`)
    let result: Biome = res.data
    return result
}