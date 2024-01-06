import apiClient from "../API"
import { AbstractDrop, Drops } from "../models/Drop"




export async function fetchDrops(targetItemId: number): Promise<AbstractDrop[]> {
  let res = await apiClient.get(`/items/${targetItemId}/drops`)
  let drop: Drops = res.data
  
  let result: AbstractDrop[] = []

  drop.biomeDrops.forEach((d) => d.type = "biome")
  drop.giftDrops.forEach((d) => d.type = "gift")
  drop.fishingDrops.forEach((d) => d.type = "fishing")
  drop.mobDrops.forEach((d) => d.type = "mob")
  drop.chestDrops.forEach((d) => d.type = "chest")

  result = result.concat(drop.biomeDrops)
  result = result.concat(drop.giftDrops)
  result = result.concat(drop.fishingDrops)
  result = result.concat(drop.mobDrops)
  result = result.concat(drop.chestDrops)

  return result
}
  