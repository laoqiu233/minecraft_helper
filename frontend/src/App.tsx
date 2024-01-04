import logo from "./logo.svg"
import "./App.css"
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
    <div className="App">
        <div className="App_sidebar">
          <AllItems/>
        </div>
        <div className="App_main">
          {recipe && <RecipeCard recipe={recipe}/>}
        </div>
        
    </div>
  )
}

export default App
