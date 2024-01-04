package io.dmtri.minecraft
package handlers

import storage.WorldStorage

import io.dmtri.minecraft.models.ApiError
import zio.http.{Method, Request, Response, Routes, handler, int}
import zio.{IO, Task, URLayer, ZIO, ZLayer}
import io.circe.syntax._
import io.circe.generic.auto._

case class WorldHandler(worldStorage: WorldStorage) {
  private def getOrError[T](t: Task[Option[T]]): IO[ApiError, T] =
    for {
      dataOpt <- t.mapError(ApiError.InternalError)
      data <- ZIO.fromOption(dataOpt).mapError(_ => ApiError.NotFoundError("not found"))
    } yield data

  private val getDimensionsRoute =
    Method.GET / "api" / "world" / "dimensions" ->
      handler { (req: Request) =>
        for {
          dimensions <- worldStorage.getAllDimensions().mapError(ApiError.InternalError)
        } yield Response.json(dimensions.asJson.toString())
      }

  private val getDimensionByIdRoute =
    Method.GET / "api" / "world" / "dimensions" / int("dimensionId") ->
      handler { (dimensionId: Int, req: Request) =>
        for {
          dimension <- getOrError(worldStorage.getDimensionById(dimensionId))
        } yield Response.json(dimension.asJson.toString())
      }

  private val getBiomesRoute =
    Method.GET / "api" / "world" / "biomes" ->
      handler { (req: Request) =>
        for {
          biomes <- worldStorage.getAllBiomes().mapError(ApiError.InternalError)
        } yield Response.json(biomes.asJson.toString())
      }

  private val getBiomeByIdRoute =
    Method.GET / "api" / "world" / "biomes" / int("biomeId") ->
      handler { (biomeId: Int, req: Request) =>
        for {
          biome <- getOrError(worldStorage.getBiomeById(biomeId))
        } yield Response.json(biome.asJson.toString())
      }

  private val getStructuresRoute =
    Method.GET / "api" / "world" / "structures" ->
      handler { (req: Request) =>
        for {
          structures <- worldStorage.getAllStructures().mapError(ApiError.InternalError)
        } yield Response.json(structures.asJson.toString())
      }

  private val getStructureByIdRoute =
    Method.GET / "api" / "world" / "structures" / int("structureId") ->
      handler { (structureId: Int, req: Request) =>
        for {
          structure <- getOrError(worldStorage.getStructureById(structureId))
        } yield Response.json(structure.asJson.toString())
      }

  private val getMobsRoute =
    Method.GET / "api" / "world" / "mobs" ->
      handler { (req: Request) =>
        for {
          mobs <- worldStorage.getAllMobs().mapError(ApiError.InternalError)
        } yield Response.json(mobs.asJson.toString())
      }

  private val getMobByIdRoute =
    Method.GET / "api" / "world" / "mobs" / int("mobId") ->
      handler { (mobId: Int, req: Request) =>
        for {
          mob <- getOrError(worldStorage.getMobById(mobId))
        } yield Response.json(mob.asJson.toString())
      }

  val routes: Routes[Any, ApiError] = Routes(
    getDimensionsRoute,
    getDimensionByIdRoute,
    getBiomesRoute,
    getBiomeByIdRoute,
    getStructuresRoute,
    getStructureByIdRoute,
    getMobsRoute,
    getMobByIdRoute
  )
}

object WorldHandler {
  val live: URLayer[WorldStorage, WorldHandler] =
    ZLayer.fromFunction(WorldHandler.apply _)
}
