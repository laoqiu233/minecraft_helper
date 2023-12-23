package io.dmtri.minecraft

import zio.http.{Handler, Server}
import zio.{Scope, ZIO, ZIOAppArgs, ZIOAppDefault}
import zio.Console._

object Main extends ZIOAppDefault {
  private val app = Handler.text("zhopa").toHttpApp
  private val port = 8000

  override val run: ZIO[Any with ZIOAppArgs with Scope, Any, Any] = {
    for {
      _ <- printLine(s"Starting server on port $port")
      _ <- Server.serve(app).provide(Server.defaultWithPort(port))
    } yield ()
  }
}