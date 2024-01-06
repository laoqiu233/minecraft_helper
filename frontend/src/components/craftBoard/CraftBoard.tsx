import { useSelector } from "react-redux"
import {
  CraftNode,
  CraftNodes,
  selectCraftNodes,
} from "../../features/craftsBoard/craftsBoardSlice"
import { CraftCard } from "../CraftCard/CraftCard"
import styles from "./CraftBoard.module.css"
import { useAppSelector } from "../../app/hooks"
export function CraftBoard() {
  const hasNodes = useAppSelector(state => 0 in state.craftBoard.craftNodes)

  return (
    <div>
      {hasNodes && <CraftCard craftNodeId={0}/>}
    </div>
  )
}
