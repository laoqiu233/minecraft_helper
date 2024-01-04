package io.dmtri.minecraft
package models

case class Mob(
    id: Int,
    name: String,
    image: String,
    hp: Int,
    playerRelation: Int,
    biomes: Seq[Biome],
    structures: Seq[Structure]
)
