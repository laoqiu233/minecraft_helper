ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "backend",
    idePackagePrefix := Some("io.dmtri.minecraft")
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
