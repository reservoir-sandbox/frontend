export interface Hashes {
    md5: string
    sha1: string
    sha256: string
}

export interface Metadata {
    hashes: Hashes
    overall_entropy: number
    magic_type: string
    mime_type: string
}

export interface ElfHeader {
    magic: string
    class: string
    data_encoding: string
    os_abi: string
    type: string
    machine: string
    entry_point: string
}

export interface Section {
    name: string
    type: string
    address: string
    size_bytes: number
    entropy: number
}

export interface Segment {
    type: string
    virtual_address: string
    memory_size_bytes: number
    flags: string
}

export interface SymbolEntry {
    name: string
    value: string
    type: string
    bind: string
}

export interface Instruction {
    address: string
    mnemonic: string
    op_str: string
    bytes: string
}

export interface Disassembly {
    architecture: number
    mode: number
    entry_point_vaddr: string
    instructions: Instruction[]
}

export interface StringsAnalysis {
    total_unique_strings_found: number
    strings: string[]
    truncated: boolean
}

export interface SecurityMitigations {
    nx: boolean
    pie: boolean
    relro: string
    stack_canary: boolean
}

export interface StaticAnalysisData {
    filename: string
    filepath: string
    file_size_bytes: number
    error?: string | null
    metadata: Metadata
    header: ElfHeader
    sections: Section[]
    segments: Segment[]
    libraries: string[]
    symbols: {
        imported: SymbolEntry[]
        exported: SymbolEntry[]
        internal: SymbolEntry[]
    }
    disassembly: Disassembly
    strings_analysis: StringsAnalysis
    security_mitigations: SecurityMitigations
    build_id: string
    compiler_info: string[]
}