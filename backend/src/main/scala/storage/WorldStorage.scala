package io.dmtri.minecraft
package storage

import io.dmtri.minecraft.models.{Biome, Dimension, Mob, Structure}
import zio.Task

trait WorldStorage {
  def getMobById(mobId: Int): Task[Option[Mob]]
  def getStructureById(structureId: Int): Task[Option[Structure]]
  def getBiomeById(biomeId: Int): Task[Option[Biome]]
  def getDimensionById(dimensionId: Int): Task[Option[Dimension]]

  def getAllMobs(): Task[Seq[Mob]]
  def getAllStructures(): Task[Seq[Structure]]
  def getAllBiomes(): Task[Seq[Biome]]
  def getAllDimensions(): Task[Seq[Dimension]]
}
