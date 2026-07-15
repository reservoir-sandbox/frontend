export interface MLEvidence {
    title: string
    explanation: string
    // The summarizer's deterministic_fallback mode has been observed to put
    // non-string values here (e.g. a raw ELF metadata object) despite the
    // documented contract - treat entries defensively when rendering.
    examples: unknown[]
    source_ids: string[]
}

export interface MLMitreAttack {
    technique_id: string
    name: string
    source_ids: string[]
}

export interface MLIndicators {
    domains: string[]
    file_paths: string[]
    hashes: string[]
    ips: string[]
    mutexes: string[]
    urls: string[]
}

export interface MLGeneration {
    mode: string
    model?: string
    eval_count?: number
    total_duration_ns?: number
    // Only present (and only meaningful) when mode === "deterministic_fallback"
    reason?: string
}

export interface MLSource {
    adapter_version: string
    filename: string
    raw_sha256: string
    strings_total: number
    strings_truncated: boolean
}

export interface MLReportData {
    verdict: string
    malware_type: string | null
    family: string | null
    confidence: number
    summary: string
    report_markdown: string
    evidence: MLEvidence[]
    indicators: MLIndicators
    mitre_attack: MLMitreAttack[]
    generation: MLGeneration
    source: MLSource
    error?: string | null
}

export interface MLAnalysisResponse {
    task_id: string
    status: string
    location: string
    report: MLReportData
}