import logo from "./logo.svg"
import "./styles.css"
import { RecipeCard } from "./components/RecipeCard/RecipeCard"
import { AllItems } from "./components/AllItems/AllItems"
import { fetchRecipe } from "./util/RecipeApi"
import { useEffect, useState } from "react"
import { useAppSelector } from "./app/hooks"

function App() {
  const { recipe } = useAppSelector((state) => state.recipe)

  return (
    <div className="app">
      <div className="app-sidebar">
        <AllItems />
      </div>
      <div className="app-main">{recipe && <RecipeCard recipe={recipe} />}</div>
    </div>
  )
}

export default App
