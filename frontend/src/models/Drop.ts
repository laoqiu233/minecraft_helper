export type Drops = {
  biomeDrops: BiomeDrop[]
  giftDrops: GiftDrop[]
  fishingDrops: FishingDrop[]
  mobDrops: MobDrop[]
  chestDrops: ChestDrop[]
}

export type AbstractDrop = BiomeDrop | GiftDrop | FishingDrop | MobDrop | ChestDrop

export type BaseDrop = {
  type: "biome" | "gift" | "fishing" | "mob" | "chest" // is not from API
  id: number
  itemId: number
  amount: number
  probability: string
  metadata: object
}

export type BiomeDrop = {
  biomeId: number
} & BaseDrop

export type GiftDrop = {
  giftSource: string
} & BaseDrop

export type FishingDrop = {} & BaseDrop

export type MobDrop = {
  mobId: number
} & BaseDrop

export type ChestDrop = {
  structureId: number
} & BaseDrop
