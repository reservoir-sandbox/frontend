import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    FileCode,
    Gauge,
    Hash,
    Binary,
    Network,
    FolderTree,
    MemoryStick,
    Bug,
    Terminal,
    FileWarning,
    Braces,
    ScanSearch,
    Info,
    AlertTriangle,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { type YaraReportData } from "./types"

function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim().length === 0
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "object") return Object.keys(value).length === 0
    return false
}

function RuleValidityBadge({ valid }: { valid: boolean }) {
    if (valid) {
        return (
            <Badge variant="outline" className="gap-1.5 border-border bg-muted/40 text-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Valid Rule
            </Badge>
        )
    }
    return (
        <Badge variant="outline" className="gap-1.5 border-primary/40 bg-primary/10 text-primary">
            <ShieldX className="h-3.5 w-3.5" />
            Invalid Rule
        </Badge>
    )
}

function EntropyBadge({ entropy }: { entropy: string }) {
    const variants: Record<string, { label: string; className: string }> = {
        high: { label: "High Entropy", className: "border-primary/40 bg-primary/10 text-primary" },
        normal: { label: "Normal Entropy", className: "border-border bg-muted/40 text-foreground" },
        low: { label: "Low Entropy", className: "border-border bg-muted/40 text-foreground" },
    }
    
    const variant = variants[entropy] || { label: entropy, className: "border-border bg-muted/40 text-foreground" }
    
    return (
        <Badge variant="outline" className={`gap-1.5 ${variant.className}`}>
            <Gauge className="h-3.5 w-3.5" />
            {variant.label}
        </Badge>
    )
}

function MetadataBadge({ label, value }: { label: string; value: boolean }) {
    return (
        <div className="rounded-4xl border border-border bg-muted/30 p-2.5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className={`text-sm font-semibold mt-0.5 ${value ? "text-primary" : "text-muted-foreground"}`}>
                {value ? "Yes" : "No"}
            </p>
        </div>
    )
}

function ImportGroup({
    label,
    icon: Icon,
    values,
}: {
    label: string
    icon: React.ElementType
    values: string[]
}) {
    if (isEmpty(values)) return null
    
    return (
        <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                {label} ({values.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
                {values.map((v, i) => (
                    <span
                        key={`${v}-${i}`}
                        className="rounded-md border border-border bg-muted/30 px-2 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                        {v}
                    </span>
                ))}
            </div>
        </div>
    )
}

function StringItem({ value, section, offset }: { value: string; section: string; offset: string }) {
    return (
        <div className="rounded-4xl border border-border bg-muted/30 p-3 space-y-1">
            <div className="flex items-start justify-between gap-2">
                <code className="text-xs font-mono break-all flex-1 text-foreground/80">{value}</code>
                <div className="shrink-0 flex gap-2 text-[10px] text-muted-foreground">
                    <span className="rounded border border-border bg-background px-1.5 py-0.5">{section}</span>
                    <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">{offset}</span>
                </div>
            </div>
        </div>
    )
}

export default function YaraReport({ data }: { data: YaraReportData }) {
    const hasMetadata = data.metadata && Object.keys(data.metadata).length > 0
    const hasImports = data.imports && Object.keys(data.imports).some(key => !isEmpty(data.imports[key as keyof typeof data.imports]))
    const hasSuspiciousImports = !isEmpty(data.suspicious_imports)
    const hasStrings = !isEmpty(data.strings_filtered)
    const hasYaraRule = !isEmpty(data.yara_rule)

    const importGroups = [
        { label: "Network", icon: Network, values: data.imports.network },
        { label: "Process", icon: Terminal, values: data.imports.process },
        { label: "Filesystem", icon: FolderTree, values: data.imports.filesystem },
        { label: "Memory", icon: MemoryStick, values: data.imports.memory },
        { label: "Anti-Debug", icon: Bug, values: data.imports.antidebug },
        { label: "Privileges", icon: ShieldAlert, values: data.imports.privileges },
        { label: "Other", icon: Braces, values: data.imports.other },
    ].filter(g => !isEmpty(g.values))

    const totalImports = Object.values(data.imports).reduce((acc, arr) => acc + arr.length, 0)

    return (
        <div className="w-full space-y-4">
            {/* Header Card */}
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-base font-mono">
                                <ScanSearch className="h-5 w-5 text-primary" />
                                YARA Analysis Report
                            </CardTitle>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <RuleValidityBadge valid={data.rule_valid} />
                            <EntropyBadge entropy={data.rodata_entropy} />
                            <Badge variant="outline" className="gap-1.5 border-border bg-muted/40 text-foreground">
                                <Binary className="h-3.5 w-3.5" />
                                {data.byte_patterns_count} patterns
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                        {hasMetadata && (
                            <>
                                <MetadataBadge label="Stripped" value={data.metadata.is_stripped} />
                                <MetadataBadge label="UPX Packed" value={data.metadata.has_upx} />
                                <MetadataBadge label="RWX Segment" value={data.metadata.has_rwx_segment} />
                                <MetadataBadge label="Exec Stack" value={data.metadata.has_exec_stack} />
                                <MetadataBadge label="Static Binary" value={data.metadata.is_static} />
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-4xl border border-border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rule Status</p>
                            <p className={`text-sm font-semibold mt-0.5 ${data.rule_valid ? "text-foreground" : "text-primary"}`}>
                                {data.rule_valid ? "Valid" : "Invalid"}
                            </p>
                        </div>
                        <div className="rounded-4xl border border-border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">RO Data Entropy</p>
                            <p className="text-sm font-semibold mt-0.5 capitalize">{data.rodata_entropy}</p>
                        </div>
                        <div className="rounded-4xl border border-border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Byte Patterns</p>
                            <p className="text-sm font-semibold mt-0.5">{data.byte_patterns_count}</p>
                        </div>
                        <div className="rounded-4xl border border-border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Imports Total</p>
                            <p className="text-sm font-semibold mt-0.5">{totalImports}</p>
                        </div>
                    </div>

                    {hasSuspiciousImports && (
                        <div className="rounded-4xl border border-primary/30 bg-primary/5 p-3">
                            <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                {data.suspicious_imports.length} suspicious import{data.suspicious_imports.length > 1 ? "s" : ""} detected
                            </p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {data.suspicious_imports.map((v, i) => (
                                    <span
                                        key={`${v}-${i}`}
                                        className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 font-mono text-[11px] text-primary"
                                    >
                                        {v}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={["rule", "strings"]} className="space-y-3">
                {/* YARA Rule */}
                {hasYaraRule && (
                    <AccordionItem value="rule" className="rounded-xl border border-border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <FileCode className="h-4 w-4 text-primary" />
                                YARA Rule
                                {data.rule_valid && (
                                    <Badge variant="outline" className="text-[10px] border-border bg-muted/40 text-foreground">
                                        Valid
                                    </Badge>
                                )}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                            <div className="rounded-4xl border border-border bg-muted/30 p-4">
                                <pre className="text-xs whitespace-pre-wrap break-all font-mono text-foreground/80 overflow-x-auto">
                                    {data.yara_rule}
                                </pre>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Imports */}
                {hasImports && (
                    <AccordionItem value="imports" className="rounded-xl border border-border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Hash className="h-4 w-4 text-primary" />
                                Imports ({totalImports})
                                {hasSuspiciousImports && (
                                    <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 bg-primary/10 text-primary">
                                        <AlertTriangle className="h-3 w-3" />
                                        {data.suspicious_imports.length} suspicious
                                    </Badge>
                                )}
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4 space-y-4">
                            {importGroups.map((g) => (
                                <ImportGroup key={g.label} label={g.label} icon={g.icon} values={g.values} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Filtered Strings */}
                {hasStrings && (
                    <AccordionItem value="strings" className="rounded-xl border border-border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <FileWarning className="h-4 w-4 text-primary" />
                                Filtered Strings ({data.strings_filtered.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                            <div className="space-y-2 max-h-96 overflow-auto">
                                {data.strings_filtered.map((str, i) => (
                                    <StringItem
                                        key={i}
                                        value={str.value}
                                        section={str.section}
                                        offset={str.offset}
                                    />
                                ))}
                            </div>
                            {data.strings_filtered.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No filtered strings found
                                </p>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Analysis Info - Table view like StaticAnalysis */}
                <AccordionItem value="info" className="rounded-xl border border-border px-1">
                    <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <Info className="h-4 w-4 text-primary" />
                            Analysis Details
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4">
                        <div className="rounded-4xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Property</TableHead>
                                        <TableHead>Value</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">Rule Status</TableCell>
                                        <TableCell className={`text-xs font-semibold ${data.rule_valid ? "text-foreground" : "text-primary"}`}>
                                            {data.rule_valid ? "Valid" : "Invalid"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">RO Data Entropy</TableCell>
                                        <TableCell className="text-xs capitalize">{data.rodata_entropy}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">Byte Patterns</TableCell>
                                        <TableCell className="text-xs">{data.byte_patterns_count}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">Total Imports</TableCell>
                                        <TableCell className="text-xs">{totalImports}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">Suspicious Imports</TableCell>
                                        <TableCell className={`text-xs ${data.suspicious_imports.length > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                                            {data.suspicious_imports.length}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="text-xs font-medium text-muted-foreground">Filtered Strings</TableCell>
                                        <TableCell className="text-xs">{data.strings_filtered.length}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}