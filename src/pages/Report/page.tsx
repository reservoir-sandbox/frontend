import { useParams } from "react-router-dom"
import type { Edge, TreeNode } from "./types"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {
    type Data,
    ProcessTree
} from "@/components/ProcessTree/component"

function convertTreeToFlow(arr: TreeNode[]): { nodes: Data[], edges: Edge[] } {
    const nodes: Data[] = []
    const edges: Edge[] = []

    function traverse(node: TreeNode, parentId?: string) {
        nodes.push({
            id: node.id,
            data: { label: node.name },
        })

        if (parentId) {
            edges.push({
                id: `e${parentId}-${node.id}`,
                source: parentId,
                target: node.id
            })
        }

        node.children?.forEach(child => traverse(child, node.id))
    }

    arr.forEach(node => traverse(node))

    return { nodes, edges }
}

const tree = [
    {
        id: "1",
        name: "systemd (PID:1)",
        children: [
            {
                id: "2",
                name: "nginx",
                children: [
                    { id: "3", name: "worker-1" },
                    { id: "4", name: "worker-2" }
                ]
            },
            { id: "5", name: "mysql" }
        ]
    },
    {
        id: "6",
        name: "something",
        children: [{
            id: "7",
            name: "something 2",
            children: []
        }]
    }
]

const { nodes, edges } = convertTreeToFlow(tree)

export default function Report() {
    const { id } = useParams()

    return (
        <Tabs defaultValue="overview" className="flex flex-col items-center w-full">
            <TabsList className="w-full max-w-4xl mb-5 flex flex-wrap justify-center gap-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="ml-summary">ML Summary</TabsTrigger>
                <TabsTrigger value="static-analysis">Static Analysis</TabsTrigger>
                <TabsTrigger value="ml-static-analysis">ML Static Analysis</TabsTrigger>
                <TabsTrigger value="process-tree">Process Tree</TabsTrigger>
                <TabsTrigger value="yara-rules">YARA Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                        <CardDescription>
                            Report ID: {id}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="results" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ml-summary" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>ML Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="static-analysis" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Static Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="ml-static-analysis" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>ML Static Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="process-tree" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Process Tree</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[65vh] md:h-[65vh] 2xl:h-[78vh] p-0">
                        <ProcessTree data={nodes} edges={edges} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="yara-rules" className="w-full">
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Generated YARA Rules</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dignissim, dui sed efficitur tincidunt, risus orci interdum justo, ut dignissim erat leo et ante. Nam tempus ipsum quis leo elementum ultrices. Fusce tempus placerat ante. Integer tincidunt imperdiet ipsum vestibulum malesuada. Proin aliquet elementum turpis, at pellentesque mi rhoncus in. Donec tempus nunc lacinia sapien vestibulum, in semper quam luctus. Maecenas eu ligula augue.
                        Aliquam et sollicitudin nisl. Proin et ipsum non massa pretium dapibus. Etiam suscipit, nibh sed imperdiet malesuada, risus velit cursus turpis, sed euismod mauris elit quis mi. Pellentesque quis arcu luctus, pharetra nunc in, feugiat lorem. Fusce aliquet ligula ac eros suscipit sagittis. Praesent semper, leo ac eleifend rutrum, purus dolor dapibus libero, a convallis ante tortor nec sem. Phasellus mattis, sapien a porttitor interdum, nunc sapien facilisis ex, eget porttitor sem odio ut purus. Integer ullamcorper urna quis nisi egestas fringilla. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Fusce rhoncus arcu non metus pulvinar, et eleifend sapien malesuada.
                    </CardContent>
                </Card>
            </TabsContent>

        </Tabs>
    )
}