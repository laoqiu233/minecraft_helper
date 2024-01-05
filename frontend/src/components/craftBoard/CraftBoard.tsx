import { useSelector } from "react-redux";
import { useAppSelector } from "../../app/hooks";
import { CraftNode, CraftNodes, selectCraftNodes } from "../../features/craftsBoard/craftsBoardSlice";
import { RecipeCard } from "../RecipeCard/RecipeCard";

export function CraftBoard() {
    const craftNodes: CraftNodes = useSelector(selectCraftNodes)

    const renderSubNodes = (craftNode: CraftNode) => {
        console.log(craftNode)
        return (
            <div>
                <RecipeCard recipeId={craftNode.recipeId} />
                {craftNode.childens.map((recipeId) => {
                    return <RecipeCard recipeId={recipeId} />
                })}
            </div>
        )
    }
    return (
        <div>
            {JSON.stringify(craftNodes)}
            {craftNodes[0] && renderSubNodes(craftNodes[0])}
        </div>
    )
}