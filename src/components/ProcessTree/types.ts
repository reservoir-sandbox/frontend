export interface Data {
    id: string,
    data: {
        label: string
    }
}

export interface Edge {
    id: string,
    source: string,
    target: string
}

export interface Node {
    id: string
    position?: { x: number; y: number }
    data: { label: string }
    type?: string
}