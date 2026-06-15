export interface TreeNode {
    id: string
    name: string
    children?: TreeNode[]
}

export interface Edge {
    id: string
    source: string
    target: string
}