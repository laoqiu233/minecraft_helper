import { useSelector } from "react-redux"
import {
  CraftNode,
  CraftNodes,
  selectCraftNodes,
} from "../../features/craftsBoard/craftsBoardSlice"
import { CraftCard } from "../CraftCard/CraftCard"
import styles from "./CraftBoard.module.css"
export function CraftBoard() {
  const craftNodes: CraftNodes = useSelector(selectCraftNodes)

  const renderSubNodes = (craftNodeId: number) => {
    return (
      <div className={styles.boardRoot}>
        <CraftCard craftNodeId={craftNodeId} />
        <div className={styles.boardChilds}>
          {craftNodes[craftNodeId].childens.map((childrenNodeId) => {
            return renderSubNodes(childrenNodeId)
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* {JSON.stringify(craftNodes)} */}
      {craftNodes[0] && renderSubNodes(0)}
    </div>
  )
}
