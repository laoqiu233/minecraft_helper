import scala.sys.process._

ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / organization := "io.dmtri"
ThisBuild / scalaVersion := "2.13.12"

lazy val buildJs = taskKey[Unit]("build javascript assets")
buildJs := {
  println("Building javascript frontend bundle")
  Process(Seq("npm", "run", "build"), new java.io.File("../frontend")).!
}

lazy val root = (project in file("."))
  .settings(
    name := "backend",
    idePackagePrefix := Some("io.dmtri.minecraft"),
    Compile / unmanagedResourceDirectories += file("../frontend/build"),
    Compile / compile := ((Compile / compile) dependsOn buildJs).value,
    assembly / assemblyJarName := "mc_helper_backend.jar",
    assembly / assemblyMergeStrategy := {
      case x if Assembly.isConfigFile(x) =>
        MergeStrategy.concat
      case PathList(ps @ _*)
          if Assembly.isReadme(ps.last) || Assembly.isLicenseFile(ps.last) =>
        MergeStrategy.rename
      case PathList("META-INF", xs @ _*) =>
        (xs map {
          _.toLowerCase
        }) match {
          case ("manifest.mf" :: Nil) | ("index.list" :: Nil) |
              ("dependencies" :: Nil) =>
            MergeStrategy.discard
          case ps @ (x :: xs)
              if ps.last.endsWith(".sf") || ps.last.endsWith(".dsa") =>
            MergeStrategy.discard
          case "plexus" :: xs =>
            MergeStrategy.discard
          case "services" :: xs =>
            MergeStrategy.filterDistinctLines
          case ("spring.schemas" :: Nil) | ("spring.handlers" :: Nil) =>
            MergeStrategy.filterDistinctLines
          case _ => MergeStrategy.first
        }
      case _ => MergeStrategy.first
    }
  )

val circeVersion = "0.14.1"

libraryDependencies += "dev.zio" %% "zio" % "2.0.20"
libraryDependencies += "dev.zio" %% "zio-http" % "3.0.0-RC4"
libraryDependencies += "dev.zio" %% "zio-jdbc" % "0.1.1"
libraryDependencies += "dev.zio" %% "zio-json" % "0.6.2"
libraryDependencies += "com.github.pureconfig" %% "pureconfig" % "0.17.4"
libraryDependencies += "org.postgresql" % "postgresql" % "42.7.1"
libraryDependencies ++= Seq(
  "io.circe" %% "circe-core",
  "io.circe" %% "circe-generic",
  "io.circe" %% "circe-parser"
).map(_ % circeVersion)
libraryDependencies += "com.github.jwt-scala" %% "jwt-circe" % "9.4.5"
libraryDependencies += "com.softwaremill.sttp.client3" %% "core" % "3.9.1"
libraryDependencies += "com.softwaremill.sttp.client3" %% "zio" % "3.9.1"
