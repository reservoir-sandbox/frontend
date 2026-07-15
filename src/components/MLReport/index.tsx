import { useMemo, useState } from "react"
import {
    ShieldAlert,
    ShieldCheck,
    ShieldQuestion,
    Skull,
    Fingerprint,
    Gauge,
    Cpu,
    Copy,
    Check,
    Network,
    FolderTree,
    Hash as HashIcon,
    Terminal as TerminalIcon,
    Crosshair,
    FileWarning,
    Sparkles,
    Boxes,
    HelpCircle
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"

import { type MLReportData, type MLGeneration } from "./types"

function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim().length === 0
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "object") return Object.keys(value).length === 0
    return false
}

function formatDuration(ns: number | null): string {
    if (ns === null || ns === undefined) return "N/A"
    const seconds = ns / 1_000_000_000
    return seconds >= 1 ? `${seconds.toFixed(2)}s` : `${(ns / 1_000_000).toFixed(0)}ms`
}

function verdictTone(verdict: string) {
    if (verdict === "malicious") {
        return {
            icon: ShieldAlert,
            className: "bg-primary/10 text-primary border-primary/30",
        }
    }
    if (verdict === "suspicious") {
        return {
            icon: ShieldQuestion,
            className: "bg-accent text-accent-foreground border-border",
        }
    }
    if (verdict === "benign") {
        return {
            icon: ShieldCheck,
            className: "bg-muted text-muted-foreground border-border",
        }
    }
    if (verdict === "inconclusive") {
        return {
            icon: HelpCircle,
            className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
        }
    }
    return {
        icon: ShieldQuestion,
        className: "bg-muted text-muted-foreground border-border",
    }
}

function ConfidenceBar({ value }: { value: number }) {
    const pct = Math.min(100, Math.max(0, value * 100))
    return (
        <div className="flex items-center gap-2 min-w-27.5">
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{pct.toFixed(0)}%</span>
        </div>
    )
}

function CopyableHash({ label, value }: { label: string; value: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(value)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // silent ignore
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 rounded-4xl border border-border bg-muted/30 px-3 py-2">
            <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="font-mono text-xs truncate">{value}</p>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={handleCopy}
                            className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                            aria-label={`Copy ${label}`}
                        >
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>{copied ? "Copied" : "Copy to clipboard"}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    )
}

function parseSimpleMarkdown(text: string): string {
    if (!text) return ""
    const html = text
        // Bold: **text** -> <strong>text</strong>
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic: *text* -> <em>text</em>
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Code: `text` -> <code>text</code>
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded font-mono text-xs">$1</code>')
        // Newline -> <br/>
        .replace(/\n/g, '<br/>')
    
    return html
}

function IndicatorGroup({
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

export default function MLReport({ data }: { data: MLReportData }) {
    const tone = verdictTone(data.verdict)
    const VerdictIcon = tone.icon
    const isFallback = data.generation.mode === "deterministic_fallback"

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const indicatorGroups = useMemo(() => {
        const groups: { label: string; icon: React.ElementType; values: string[] }[] = [
            { label: "IP addresses", icon: Network, values: data.indicators.ips },
            { label: "Domains", icon: Network, values: data.indicators.domains },
            { label: "URLs", icon: Network, values: data.indicators.urls },
            { label: "File paths", icon: FolderTree, values: data.indicators.file_paths },
            { label: "Hashes", icon: HashIcon, values: data.indicators.hashes },
            { label: "Mutexes", icon: Boxes, values: data.indicators.mutexes },
        ]
        return groups.filter((g) => !isEmpty(g.values))
    }, [data.indicators])

    const hasIndicators = indicatorGroups.length > 0
    const hasEvidence = !isEmpty(data.evidence)
    const hasMitre = !isEmpty(data.mitre_attack)
    const hasFamily = !isEmpty(data.family)
    const hasMalwareType = !isEmpty(data.malware_type)
    const hasNarrative = !isEmpty(data.report_markdown)

    return (
        <div className="w-full space-y-4">
            <Card className="border-border">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle className="font-mono text-base">{data.source.filename}</CardTitle>
                            {!isEmpty(data.summary) && (
                                <CardDescription className="mt-1">{data.summary}</CardDescription>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`gap-1.5 ${tone.className}`}>
                                <VerdictIcon className="h-3.5 w-3.5" />
                                {data.verdict}
                            </Badge>
                            {hasMalwareType && (
                                <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                                    <Skull className="h-3.5 w-3.5" />
                                    {data.malware_type}
                                </Badge>
                            )}
                            {hasFamily && (
                                <Badge variant="secondary" className="gap-1.5">
                                    <Crosshair className="h-3.5 w-3.5" />
                                    {data.family}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <Gauge className="h-3 w-3" /> Confidence
                            </p>
                            <div className="mt-0.5">
                                <ConfidenceBar value={data.confidence} />
                            </div>
                        </div>
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Family</p>
                            <p className="text-sm font-semibold">
                                {hasFamily ? data.family : <span className="text-muted-foreground font-normal">Unattributed</span>}
                            </p>
                        </div>
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                                <Cpu className="h-3 w-3" /> Model
                            </p>
                            <p className="text-sm font-semibold truncate">
                                {data.generation.mode === "llm" 
                                    ? data.generation.model 
                                    : "Fallback"}
                            </p>
                        </div>
                    </div>

                    <CopyableHash label="SHA-256" value={data.source.raw_sha256} />

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
                        {renderGenerationInfo(data.generation)}
                        <div className="rounded-4xl border bg-muted/30 p-2.5">
                            <p className="uppercase tracking-wide text-muted-foreground">Strings scanned</p>
                            <p className="font-mono mt-0.5">
                                {data.source.strings_total !== null && data.source.strings_total !== undefined
                                    ? data.source.strings_total
                                    : "N/A"}
                                {data.source.strings_truncated ? " (truncated)" : ""}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Accordion type="multiple" defaultValue={["evidence"]} className="space-y-3">
                {hasEvidence && (
                    <AccordionItem value="evidence" className="rounded-xl border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Fingerprint className="h-4 w-4 text-primary" />
                                Evidence ({data.evidence.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4 space-y-3">
                            {data.evidence.map((ev, i) => (
                                <div key={i} className="rounded-4xl border bg-muted/30 p-3 space-y-2">
                                    <p className="text-sm font-medium">{ev.title}</p>
                                    {!isEmpty(ev.explanation) && (
                                        <p className="text-xs text-muted-foreground">{ev.explanation}</p>
                                    )}
                                    {!isEmpty(ev.examples) && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {ev.examples.map((ex, j) => (
                                                <span
                                                    key={j}
                                                    className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px]"
                                                >
                                                    {ex}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {!isEmpty(ev.source_ids) && (
                                        <div className="flex flex-wrap gap-1">
                                            {ev.source_ids.map((sid, j) => (
                                                <Badge key={j} variant="outline" className="text-[10px] font-mono">
                                                    {sid}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {hasIndicators && (
                    <AccordionItem value="indicators" className="rounded-xl border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Network className="h-4 w-4 text-primary" />
                                Indicators
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4 space-y-4">
                            {indicatorGroups.map((g) => (
                                <IndicatorGroup key={g.label} label={g.label} icon={g.icon} values={g.values} />
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                )}

                {hasMitre && (
                    <AccordionItem value="mitre" className="rounded-xl border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <TerminalIcon className="h-4 w-4 text-primary" />
                                MITRE ATT&CK ({data.mitre_attack.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                            <div className="rounded-4xl border overflow-hidden">
                                <div className="max-h-64 overflow-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Technique</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Sources</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.mitre_attack.map((m, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">{m.technique_id}</TableCell>
                                                    <TableCell className="text-xs">{m.name}</TableCell>
                                                    <TableCell className="text-xs font-mono text-muted-foreground">
                                                        {m.source_ids.join(", ")}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {hasYaraMatches && (
                    <AccordionItem value="yara" className="rounded-xl border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <FileWarning className="h-4 w-4 text-primary" />
                                YARA Matches ({data.yara_matches?.length || 0})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                            <div className="rounded-4xl border bg-muted/30 p-3">
                                <pre className="text-xs whitespace-pre-wrap break-all font-mono text-muted-foreground">
                                    {JSON.stringify(data.yara_matches, null, 2)}
                                </pre>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {hasNarrative && (
                    <AccordionItem value="narrative" className="rounded-xl border px-1">
                        <AccordionTrigger className="px-3 hover:no-underline">
                            <span className="flex items-center gap-2 text-sm font-medium">
                                <Sparkles className="h-4 w-4 text-primary" />
                                Summary
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-3 pb-4">
                            <div className="rounded-4xl border bg-muted/30 p-4">
                                <div
                                    className="text-xs leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{
                                        __html: parseSimpleMarkdown(data.report_markdown)
                                    }}
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    )
}