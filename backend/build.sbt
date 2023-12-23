ThisBuild / version := "0.1.0-SNAPSHOT"

ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "backend",
    idePackagePrefix := Some("io.dmtri.minecraft")
  )

libraryDependencies += "dev.zio" %% "zio" % "2.0.20"
libraryDependencies += "dev.zio" %% "zio-http" % "3.0.0-RC4"