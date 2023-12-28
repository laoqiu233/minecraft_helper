package io.dmtri.minecraft
package config

import config.Config._

import pureconfig.ConfigSource
import pureconfig.error.ConfigReaderFailures
import zio.{IO, ZIO, ZLayer}
import pureconfig.generic.auto._

case class Config(api: ApiConfig, postgres: PostgresConfig)

object Config {
  case class ApiConfig(port: Int)
  case class PostgresConfig(host: String, port: Int, db: String, username: String, password: String) {
    def getProperties: Map[String, String] =
      Map(
        "user" -> username,
        "password" -> password
      )
  }

  def loadConfig: IO[ConfigReaderFailures, Config] =
    ZIO.fromEither(ConfigSource.default.load[Config])

  def configLive: ZLayer[Any, ConfigReaderFailures, Config] =
    ZLayer.fromZIO(loadConfig)
}
