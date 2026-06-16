import "@xyflow/react/dist/style.css"
import dagre from "@dagrejs/dagre"
import type { Data, Edge, Node } from './types'

import {
    Background,
    ReactFlow,
    Controls,
    type FitViewOptions,
    ReactFlowProvider,
} from "@xyflow/react"

import { ProcessNode } from "@/components/ProcessNode/component"

const nodeTypes = {
    baseNodeFull: ProcessNode
}

const fitViewOptions: FitViewOptions = {
    padding: 0.9
}

function getLayoutedElements(nodes: Node[], edges: Edge[], nodeWidth = 144, nodeHeight = 60) {
    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: "TB", ranksep: 80, nodesep: 50 })

    nodes.forEach(node => g.setNode(node.id, { width: nodeWidth, height: nodeHeight }))
    edges.forEach(edge => g.setEdge(edge.source, edge.target))

    dagre.layout(g)

    return nodes.map(node => {
        const { x, y } = g.node(node.id)
        return { ...node, position: { x: x - nodeWidth / 2, y: y - nodeHeight / 2 }, type: "baseNodeFull" }
    })
}

export function ProcessTree({ data, edges = [] }: { data: Data[], edges?: Edge[] }) {
    const layoutedNodes = getLayoutedElements(data, edges)

    return (
        <ReactFlowProvider>
            <div style={{ width: '100%', height: '100%' }}>
                <ReactFlow
                    defaultNodes={layoutedNodes}
                    defaultEdges={edges}
                    nodeTypes={nodeTypes}
                    fitView
                    fitViewOptions={fitViewOptions}
                    defaultEdgeOptions={{
                        style: { stroke: 'white', strokeWidth: 1 },
                        type: 'smoothstep',
                        animated: true,
                    }}
                    colorMode="dark"
                    nodesDraggable={false}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </ReactFlowProvider>
    )
}