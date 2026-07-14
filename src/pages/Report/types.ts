export type JobTask = {
    id: number
    job_id: number
    task_type: "static" | "sandbox" | "ml"
    status: "pending" | "running" | "completed" | "failed"
    report_object_name: string | null
    result: unknown | null
    created_at: string
    started_at: string | null
    finished_at: string | null
    error: string | null
}

export type Job = {
    id: number
    sample_id: number
    status: "pending" | "running" | "completed" | "failed"
    created_at: string
    started_at: string | null
    finished_at: string | null
    tasks: JobTask[]
}

export type TabKey = "ml" | "static-analysis"