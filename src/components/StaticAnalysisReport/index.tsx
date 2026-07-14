import { useMemo, useState } from "react"
import {
    ShieldCheck,
    ShieldAlert,
    ShieldQuestion,
    KeyRound,
    Copy,
    Check,
    Fingerprint,
    Cpu,
    FileWarning,
    Boxes,
    Library,
    Binary,
    Terminal,
    Hash,
    Layers,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
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

import { type ReportData } from "./types"

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const units = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2)} ${units[i]}`
}

function entropyTone(entropy: number): { label: string; className: string } {
    if (entropy >= 6.5) return { label: "High", className: "bg-primary/15 text-primary border-primary/30" }
    if (entropy >= 3.5) return { label: "Medium", className: "bg-accent text-accent-foreground border-border" }
    return { label: "Low", className: "bg-muted text-muted-foreground border-border" }
}

function EntropyBar({ value, max = 8 }: { value: number; max?: number }) {
    const pct = Math.min(100, (value / max) * 100)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tone = entropyTone(value)
    return (
        <div className="flex items-center gap-2 min-w-27.5">
            <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                <div
                    className={`h-full rounded-full ${value >= 6.5 ? "bg-primary" : "bg-foreground/40"}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{value.toFixed(2)}</span>
        </div>
    )
}

function CopyableHash({ label, value, emphasize = false }: { label: string; value: string; emphasize?: boolean }) {
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
        <div className={`flex items-center justify-between gap-3 rounded-4xl border px-3 py-2 ${emphasize ? "border-primary/30 bg-primary/5" : "border-border bg-muted/30"}`}>
            <div className="min-w-0">
                <p className={`text-[11px] uppercase tracking-wide ${emphasize ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                </p>
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

function MitigationPill({
    label,
    ok,
    detail,
}: {
    label: string
    ok: boolean | "partial"
    detail: string
}) {
    const Icon = ok === true ? ShieldCheck : ok === "partial" ? ShieldQuestion : ShieldAlert
    const tone =
        ok === true
            ? "border-border bg-muted/40 text-foreground"
            : ok === "partial"
                ? "border-primary/30 bg-primary/5 text-primary"
                : "border-primary/40 bg-primary/10 text-primary"

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium cursor-default ${tone}`}>
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </div>
                </TooltipTrigger>
                <TooltipContent>{detail}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

const SUSPICIOUS_PATTERN = /pass(word)?|secret|token|flag|credential|admin|api[_-]?key/i

function isSuspiciousString(s: string) {
    return SUSPICIOUS_PATTERN.test(s)
}

export default function StaticAnalysisReport({ data }: { data: ReportData }) {
    const suspiciousStrings = useMemo(
        () => data.strings_analysis.strings.filter(isSuspiciousString),
        [data.strings_analysis.strings]
    )

    const relro = data.security_mitigations.relro
    const relroOk: boolean | "partial" =
        relro === "Full RELRO" ? true : relro === "Partial RELRO" ? "partial" : false

    return (
        <div className="w-full space-y-4">
            {data.error && (
                <Alert variant="destructive" className="border-primary/40 bg-primary/5 text-primary">
                    <FileWarning className="h-4 w-4" />
                    <AlertTitle>Analysis error</AlertTitle>
                    <AlertDescription>{data.error}</AlertDescription>
                </Alert>
            )}

            <Card className="border-border">
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <CardTitle className="font-mono text-base">{data.filename}</CardTitle>
                            <CardDescription className="mt-1">{data.metadata.magic_type}</CardDescription>
                        </div>
                        <Badge variant="outline" className="gap-1.5 border-primary/30 text-primary">
                            <Cpu className="h-3.5 w-3.5" />
                            {data.header.machine}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">File size</p>
                            <p className="text-sm font-semibold">{formatBytes(data.file_size_bytes)}</p>
                        </div>
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Entry point</p>
                            <p className="text-sm font-semibold font-mono">{data.header.entry_point}</p>
                        </div>
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overall entropy</p>
                            <div className="mt-0.5">
                                <EntropyBar value={data.metadata.overall_entropy} />
                            </div>
                        </div>
                        <div className="rounded-4xl border bg-muted/30 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">File type</p>
                            <p className="text-sm font-semibold">{data.header.type}</p>
                        </div>
                    </div>

                    <CopyableHash label="SHA-256" value={data.metadata.hashes.sha256} emphasize />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <CopyableHash label="MD5" value={data.metadata.hashes.md5} />
                        <CopyableHash label="SHA-1" value={data.metadata.hashes.sha1} />
                    </div>

                    <Separator />

                    <div>
                        <p className="mb-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                            Security mitigations
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <MitigationPill
                                label="NX"
                                ok={data.security_mitigations.nx}
                                detail={data.security_mitigations.nx ? "Stack/heap execution is disabled." : "No-execute is not enforced — stack/heap regions are executable."}
                            />
                            <MitigationPill
                                label="PIE"
                                ok={data.security_mitigations.pie}
                                detail={data.security_mitigations.pie ? "Loaded at a randomized base address." : "Fixed load address — no ASLR for the binary itself."}
                            />
                            <MitigationPill
                                label={relro}
                                ok={relroOk}
                                detail={relroOk === true ? "GOT is fully read-only after relocation." : relroOk === "partial" ? "GOT is only partially protected." : "GOT remains writable — a common exploitation target."}
                            />
                            <MitigationPill
                                label="Stack canary"
                                ok={data.security_mitigations.stack_canary}
                                detail={data.security_mitigations.stack_canary ? "Stack buffer overflows are detected before return." : "No canary — stack buffer overflows won't be caught."}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {suspiciousStrings.length > 0 && (
                <Alert className="border-primary/30 bg-primary/5">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Flagged strings found</AlertTitle>
                    <AlertDescription>
                        {suspiciousStrings.length} string{suspiciousStrings.length > 1 ? "s" : ""} matched
                        password/secret/flag-like patterns. Review the &ldquo;Strings &amp; build info&rdquo; section below.
                    </AlertDescription>
                </Alert>
            )}

            <Accordion type="multiple" defaultValue={["layout"]} className="space-y-3">
                <AccordionItem value="layout" className="rounded-xl border px-1">
                    <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <Layers className="h-4 w-4 text-primary" />
                            Header, segments &amp; sections
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4 space-y-4">
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-xs">
                            {Object.entries(data.header).map(([key, value]) => (
                                <div key={key} className="rounded-4xl border bg-muted/30 p-2.5">
                                    <p className="uppercase tracking-wide text-muted-foreground">{key.replace(/_/g, " ")}</p>
                                    <p className="font-mono mt-0.5 truncate">{value}</p>
                                </div>
                            ))}
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Segments ({data.segments.length})</p>
                            <div className="rounded-4xl border overflow-hidden">
                                <ScrollArea className="max-h-64">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Virtual address</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Flags</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.segments.map((seg, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">{seg.type}</TableCell>
                                                    <TableCell className="font-mono text-xs">{seg.virtual_address}</TableCell>
                                                    <TableCell className="text-xs">{formatBytes(seg.memory_size_bytes)}</TableCell>
                                                    <TableCell className="font-mono text-xs">{seg.flags}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Sections ({data.sections.length})</p>
                            <div className="rounded-4xl border overflow-hidden">
                                <ScrollArea className="max-h-72">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Address</TableHead>
                                                <TableHead>Size</TableHead>
                                                <TableHead>Entropy</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.sections.map((sec, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">{sec.name || <span className="text-muted-foreground">—</span>}</TableCell>
                                                    <TableCell className="text-xs">{sec.type}</TableCell>
                                                    <TableCell className="font-mono text-xs">{sec.address}</TableCell>
                                                    <TableCell className="text-xs">{formatBytes(sec.size_bytes)}</TableCell>
                                                    <TableCell><EntropyBar value={sec.entropy} /></TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="linkage" className="rounded-xl border px-1">
                    <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <Library className="h-4 w-4 text-primary" />
                            Libraries, imports &amp; exports
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4 space-y-4">
                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">Linked libraries</p>
                            <div className="flex flex-wrap gap-2">
                                {data.libraries.map((lib) => (
                                    <Badge key={lib} variant="secondary" className="font-mono">
                                        <Boxes className="mr-1 h-3 w-3" />
                                        {lib}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Imported symbols ({data.symbols.imported.length})
                            </p>
                            <div className="rounded-4xl border overflow-hidden">
                                <ScrollArea className="max-h-64">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Bind</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.symbols.imported.map((sym, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">{sym.name}</TableCell>
                                                    <TableCell className="text-xs">{sym.type}</TableCell>
                                                    <TableCell className="text-xs">{sym.bind}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Exported symbols ({data.symbols.exported.length})
                            </p>
                            {data.symbols.exported.length === 0 ? (
                                <p className="rounded-4xl border border-dashed p-3 text-xs text-muted-foreground">
                                    No exported symbols — nothing in this binary is exposed for external linking.
                                </p>
                            ) : (
                                <div className="rounded-4xl border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Value</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Bind</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.symbols.exported.map((sym, i) => (
                                                <TableRow key={i}>
                                                    <TableCell className="font-mono text-xs">{sym.name}</TableCell>
                                                    <TableCell className="font-mono text-xs">{sym.value}</TableCell>
                                                    <TableCell className="text-xs">{sym.type}</TableCell>
                                                    <TableCell className="text-xs">{sym.bind}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="provenance" className="rounded-xl border px-1">
                    <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <Fingerprint className="h-4 w-4 text-primary" />
                            Strings &amp; build info
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4 space-y-4">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <div className="rounded-4xl border bg-muted/30 p-2.5">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Build ID</p>
                                <p className="font-mono text-xs mt-0.5 truncate">{data.build_id}</p>
                            </div>
                            <div className="rounded-4xl border bg-muted/30 p-2.5">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Compiler</p>
                                <p className="text-xs mt-0.5 truncate">{data.compiler_info.join(", ")}</p>
                            </div>
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="text-xs font-medium text-muted-foreground">
                                    Strings ({data.strings_analysis.total_unique_strings_found} unique
                                    {data.strings_analysis.truncated ? ", truncated" : ""})
                                </p>
                                {suspiciousStrings.length > 0 && (
                                    <Badge className="bg-primary/10 text-primary border border-primary/30 gap-1">
                                        <KeyRound className="h-3 w-3" />
                                        {suspiciousStrings.length} flagged
                                    </Badge>
                                )}
                            </div>
                            <ScrollArea className="max-h-56 rounded-4xl border">
                                <div className="flex flex-wrap gap-1.5 p-3">
                                    {data.strings_analysis.strings.map((s, i) => {
                                        const flagged = isSuspiciousString(s)
                                        return (
                                            <span
                                                key={`${s}-${i}`}
                                                className={`rounded-md border px-2 py-1 font-mono text-[11px] ${
                                                    flagged
                                                        ? "border-primary/40 bg-primary/10 text-primary"
                                                        : "border-border bg-muted/30 text-muted-foreground"
                                                }`}
                                            >
                                                {s}
                                            </span>
                                        )
                                    })}
                                </div>
                            </ScrollArea>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="code" className="rounded-xl border px-1">
                    <AccordionTrigger className="px-3 hover:no-underline">
                        <span className="flex items-center gap-2 text-sm font-medium">
                            <Terminal className="h-4 w-4 text-primary" />
                            Disassembly &amp; internal symbols
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 pb-4 space-y-4">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="gap-1">
                                <Binary className="h-3 w-3" /> arch {data.disassembly.architecture} / mode {data.disassembly.mode}
                            </Badge>
                            <Badge variant="outline" className="gap-1 font-mono">
                                <Hash className="h-3 w-3" /> entry {data.disassembly.entry_point_vaddr}
                            </Badge>
                        </div>

                        <div className="rounded-4xl border overflow-hidden">
                            <ScrollArea className="max-h-96">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Bytes</TableHead>
                                            <TableHead>Mnemonic</TableHead>
                                            <TableHead>Operands</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.disassembly.instructions.map((ins, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-xs">{ins.address}</TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">{ins.bytes}</TableCell>
                                                <TableCell className="font-mono text-xs font-medium text-primary">{ins.mnemonic}</TableCell>
                                                <TableCell className="font-mono text-xs">{ins.op_str}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </div>

                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Internal symbols ({data.symbols.internal.length})
                            </p>
                            {data.symbols.internal.length === 0 ? (
                                <p className="rounded-4xl border border-dashed p-3 text-xs text-muted-foreground">
                                    No internal (local) symbols were recovered from the symbol table.
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Value</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Bind</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.symbols.internal.map((sym, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-xs">{sym.name}</TableCell>
                                                <TableCell className="font-mono text-xs">{sym.value}</TableCell>
                                                <TableCell className="text-xs">{sym.type}</TableCell>
                                                <TableCell className="text-xs">{sym.bind}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}