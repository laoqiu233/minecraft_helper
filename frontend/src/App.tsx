import logo from "./logo.svg"
import "./styles.css"
import { RecipeCard } from "./components/RecipeCard"
import { AllItems } from "./components/AllItems"
import { fetchRecipe } from "./util/RecipeApi"
import { useEffect, useState } from "react"

function App() {
  const [recipe, setRecipe] = useState<RecipeUI | undefined>(undefined)

  useEffect(() => {
    fetchRecipe(6).then((recipe) => {
      recipe && setRecipe(recipe)
    })
  })

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
