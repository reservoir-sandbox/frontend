export interface YaraReportData {
    yara_rule: string
    rule_valid: boolean
    metadata: {
        is_stripped: boolean
        has_upx: boolean
        has_rwx_segment: boolean
        has_exec_stack: boolean
        is_static: boolean
    }
    rodata_entropy: string
    imports: {
        network: string[]
        process: string[]
        memory: string[]
        antidebug: string[]
        filesystem: string[]
        privileges: string[]
        other: string[]
    }
    suspicious_imports: string[]
    strings_filtered: Array<{
        value: string
        section: string
        offset: string
    }>
    byte_patterns_count: number
}