import { useAppDispatch, useAppSelector } from "../../app/hooks"
import {
  CraftNode,
  NodeTargetType,
  addChildEntityToBoardThunk,
} from "../../features/craftsBoard/craftsBoardSlice"
import { MobCard } from "./formats/MobCard"
import styles from "./CraftCard.module.css"
import { ItemCard } from "./formats/ItemCard"

interface CraftCardTypeProps {
  craftNodeId: number
}



export function CraftCard({ craftNodeId }: CraftCardTypeProps) {
  const childrenNodeIds = useAppSelector(state => state.craftBoard.craftNodes[craftNodeId].children)
  const dispatch = useAppDispatch()

  const craftNode: CraftNode = useAppSelector(
    (state) => state.craftBoard.craftNodes[craftNodeId],
  )

  const addChildNode = (targetId: number, targetType: NodeTargetType) => {
    dispatch(
      addChildEntityToBoardThunk({
        parentNodeId: craftNodeId,
        childTargetId: targetId,
        childTargetType: targetType
      }),
    )
  }

  return (
    <div className={styles.craftCard}>
      <div className={styles.craftCardInner}>
        {craftNode && craftNode.targetType == "item" && <ItemCard craftNodeId={craftNodeId} worldEntityClickCallBack={addChildNode}/>}
        {craftNode && craftNode.targetType == "mob" && <MobCard craftNodeId={craftNodeId} worldEntityClickCallBack={addChildNode}/>}
      </div>

      { childrenNodeIds.length > 0 &&
        <div className={styles.craftCardChildren}>
          {childrenNodeIds.map((id) => <CraftCard craftNodeId={id}/>)}
        </div>
      }
    </div>
  )
}
