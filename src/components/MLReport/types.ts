
export interface MLEvidence {
  title: string
  explanation: string
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

export type MLGeneration =
  | {
      mode: "llm"
      model: string
      eval_count: number | null
      total_duration_ns: number | null
    }
  | {
      mode: "deterministic_fallback"
      reason: string
    }

export interface MLSource {
  adapter_version: string
  filename: string
  raw_sha256: string
  strings_total: number | null
  strings_truncated: boolean
}

export interface MLReportData {
  verdict: "malicious" | "suspicious" | "benign" | "inconclusive"
  malware_type: string
  family: string | null
  confidence: number
  summary: string
  report_markdown: string
  evidence: MLEvidence[]
  indicators: MLIndicators
  mitre_attack: MLMitreAttack[]
  generation: MLGeneration
  source: MLSource
  yara_matches?: unknown[]
}