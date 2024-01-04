package io.dmtri.minecraft
package storage.jdbc

import io.dmtri.minecraft.models.{Biome, Dimension, Mob, Structure}
import io.dmtri.minecraft.storage.WorldStorage
import io.dmtri.minecraft.storage.jdbc.JdbcWorldStorage.live
import zio.{Task, URLayer, ZLayer}
import zio.jdbc.{ZConnectionPool, sqlInterpolator, transaction}

case class JdbcWorldStorage(pool: ZConnectionPool)
    extends WorldStorage
    with JdbcStorage {
  private def getMobQuery(mobId: Int) = {
    val mobQuery =
      sql"""
           SELECT id, name, image, hp, player_relation
           FROM mob
           WHERE id = $mobId
         """.query[(Int, String, String, Int, Int)].selectOne

    val structuresQuery =
      sql"""
           SELECT structure_id
           FROM structure_mob
           WHERE mob_id = $mobId
         """
        .query[Int]
        .selectAll
        .flatMap(_.mapZIO(getStructureQuery))
        .map(_.flatten)

    val biomesQuery =
      sql"""
           SELECT biome_id
           FROM biome_mob
           WHERE mob_id = $mobId
         """
        .query[Int]
        .selectAll
        .flatMap(_.mapZIO(getBiomeQuery))
        .map(_.flatten)

    for {
      mobData <- mobQuery
      structures <- structuresQuery
      biomes <- biomesQuery
    } yield mobData.map { case (id, name, image, hp, playerRelation) =>
      Mob(
        id,
        name,
        image,
        hp,
        playerRelation,
        biomes,
        structures
      )
    }
  }

  override def getMobById(mobId: Int): Task[Option[Mob]] = transaction {
    getMobQuery(mobId)
  }.provideLayer(poolLayer)

  private def getStructureQuery(structureId: Int) = {
    val structureQuery =
      sql"""
           SELECT id, name, image, description
           FROM structure
           WHERE id = $structureId
         """.query[(Int, String, String, String)].selectOne

    val structureBiomesQuery =
      sql"""
           SELECT biome_id
           FROM biome_structure
           WHERE structure_id = $structureId
         """
        .query[Int]
        .selectAll
        .flatMap(_.mapZIO(getBiomeQuery))
        .map(_.flatten)

    for {
      structureData <- structureQuery
      biomes <- structureBiomesQuery
    } yield structureData.map { case (id, name, image, description) =>
      Structure(
        id,
        name,
        image,
        description,
        biomes
      )
    }
  }

  override def getStructureById(structureId: Int): Task[Option[Structure]] =
    transaction {
      getStructureQuery(structureId)
    }.provideLayer(poolLayer)

  private def getBiomeQuery(biomeId: Int) = {
    sql"""
         SELECT b.id, b.name, b.image, b.description, d.id, d.name, d.image, d.description
         FROM biome b
         JOIN dimension d on b.dimension_id = d.id
         WHERE b.id = $biomeId
       """
      .query[(Int, String, String, String, Int, String, String, String)]
      .selectOne
      .map(_.map {
        case (
              biomeId,
              biomeName,
              biomeImage,
              biomeDescription,
              dimId,
              dimName,
              dimImage,
              dimDescription
            ) =>
          Biome(
            biomeId,
            biomeName,
            biomeImage,
            biomeDescription,
            Dimension(
              dimId,
              dimName,
              dimImage,
              dimDescription
            )
          )
      })
  }

  override def getBiomeById(biomeId: Int): Task[Option[Biome]] = transaction {
    getBiomeQuery(biomeId)
  }.provideLayer(poolLayer)

  private def getDimensionQuery(dimensionId: Int) =
    sql"""
         SELECT id, name, image, description
         FROM dimension
         WHERE id = $dimensionId
       """
      .query[(Int, String, String, String)]
      .selectOne
      .map(_.map((Dimension.apply _).tupled))

  override def getDimensionById(dimensionId: Int): Task[Option[Dimension]] =
    transaction {
      getDimensionQuery(dimensionId)
    }.provideLayer(poolLayer)

  override def getAllMobs(): Task[Seq[Mob]] = transaction {
    sql"""
         SELECT id
         FROM mob
       """.query[Int].selectAll.flatMap(_.mapZIO(getMobQuery)).map(_.flatten)
  }.provideLayer(poolLayer)

  override def getAllStructures(): Task[Seq[Structure]] = transaction {
    sql"""
         SELECT id
         FROM structure
       """
      .query[Int]
      .selectAll
      .flatMap(_.mapZIO(getStructureQuery))
      .map(_.flatten)
  }.provideLayer(poolLayer)

  override def getAllBiomes(): Task[Seq[Biome]] = transaction {
    sql"""
         SELECT id
         FROM biome
       """.query[Int].selectAll.flatMap(_.mapZIO(getBiomeQuery)).map(_.flatten)
  }.provideLayer(poolLayer)

  override def getAllDimensions(): Task[Seq[Dimension]] = transaction {
    sql"""
         SELECT id, name, image, description
         FROM dimension
       """
      .query[(Int, String, String, String)]
      .selectAll
      .map(_.map((Dimension.apply _).tupled))
  }.provideLayer(poolLayer)
}

object JdbcWorldStorage {
  val live: URLayer[ZConnectionPool, JdbcWorldStorage] =
    ZLayer.fromFunction(JdbcWorldStorage.apply _)
}
