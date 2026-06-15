import { memo } from "react";
import { Handle, Position } from "@xyflow/react"
import {
    BaseNode,
    BaseNodeContent,
} from "@/components/BaseNode/component"

export const ProcessNode = memo(({ data }: { data?: { label?: string } }) => {
    const label = data?.label || "systemd";

    return (
        <BaseNode className="w-36">
            <BaseNodeContent>
            <Handle type="target" position={Position.Top} />
                <div className="text-lg font-bold text-center">
                    {label}
                </div>
            </BaseNodeContent>
            <Handle type="source" position={Position.Bottom} />
        </BaseNode>
    )
});