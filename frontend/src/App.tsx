
import "./styles.css"
import { AllItems } from "./components/AllItems/AllItems"
import { CraftBoard } from "./components/craftBoard/CraftBoard"

function App() {

  return (
    <div className="app">
      <div className="app-sidebar">
        <AllItems />
      </div>
      <div className="app-main">
        <CraftBoard />
      </div>
    </div>
  )
}

export default App
