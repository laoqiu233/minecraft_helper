import { AbstractDrop } from "../../models/Drop";

interface DropCardProps {
    drop: AbstractDrop
}

export function DropCard({ drop }: DropCardProps) {
    return (
        <div>
            {JSON.stringify(drop)}
        </div>
    )
}