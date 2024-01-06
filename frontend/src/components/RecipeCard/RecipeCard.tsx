import styles from "./RecipeCard.module.css"
import { Cell } from "../Cell/Cell"
import {
  CraftingShapedCard,
  CraftingShapelessCard,
} from "./formats/CraftingCard"
import { SmeltingCard } from "./formats/SmeltingCard"
import { useAppSelector } from "../../app/hooks"

interface RecipeTypeProps {
  recipe: Recipe,
  itemClickCallBack: (targetItemId: number) => void
}

export function RecipeCard({ recipe, itemClickCallBack }: RecipeTypeProps) {
  if (!recipe) {
    return <p>fuck you1</p>
  } else if (recipe.CraftingShaped) {
    return <CraftingShapedCard recipe={recipe.CraftingShaped} itemClickCallBack={ itemClickCallBack} />
  } else if (recipe.CraftingShapeless) {
    return <CraftingShapelessCard recipe={recipe.CraftingShapeless} itemClickCallBack={ itemClickCallBack} />
  } else if (recipe.Smelting) {
    return <SmeltingCard recipe={recipe.Smelting}/>
  } else {
    return <p>fuck you2</p>
  }
}
