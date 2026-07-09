import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
    Loader2,
    ShieldAlert,
    ShieldCheck,
    FileCode2,
    Cpu,
    HardDrive,
    Network,
    KeyRound,
    Terminal,
    ListTree,
    FlaskConical,
} from "lucide-react"
import type { Edge, TreeNode } from "./types"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { ProcessTree } from "@/components/ProcessTree/component"
import { type Data } from "@/components/ProcessTree/types"
import { Skeleton } from "@/components/ui/skeleton"

function convertTreeToFlow(arr: TreeNode[]): { nodes: Data[], edges: Edge[] } {
    const nodes: Data[] = []
    const edges: Edge[] = []

    function traverse(node: TreeNode, parentId?: string) {
        nodes.push({
            id: node.id,
            data: { label: node.name },
        })

        if (parentId) {
            edges.push({
                id: `e${parentId}-${node.id}`,
                source: parentId,
                target: node.id
            })
        }

        node.children?.forEach(child => traverse(child, node.id))
    }

    arr.forEach(node => traverse(node))

    return { nodes, edges }
}

// example.elf is a single, short-lived process — no children spawned
const tree = [
    {
        id: "1",
        name: "example.elf (PID:1842)",
        children: []
    }
]

const { nodes, edges } = convertTreeToFlow(tree)

const TAB_KEYS = [
    "overview",
    "results",
    "ml-summary",
    "static-analysis",
    "ml-static-analysis",
    "process-tree",
    "yara-rules",
] as const

type TabKey = typeof TAB_KEYS[number]

const TABS: { value: TabKey, label: string }[] = [
    { value: "overview", label: "Overview" },
    { value: "results", label: "Results" },
    { value: "ml-summary", label: "ML Summary" },
    { value: "static-analysis", label: "Static Analysis" },
    { value: "ml-static-analysis", label: "ML Static Analysis" },
    { value: "process-tree", label: "Process Tree" },
    { value: "yara-rules", label: "YARA Rules" },
]

const initialLoadingState = (): Record<TabKey, boolean> =>
    TAB_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<TabKey, boolean>)

function simulateBackendStatus(
    onTabReady: (tab: TabKey) => void,
    signal: { cancelled: boolean }
) {
    const fakeDelays: Record<TabKey, number> = {
        "overview": 800,
        "results": 1500,
        "ml-summary": 2200,
        "static-analysis": 1200,
        "ml-static-analysis": 3000,
        "process-tree": 2600,
        "yara-rules": 3500,
    }

    TAB_KEYS.forEach((key) => {
        setTimeout(() => {
            if (!signal.cancelled) {
                onTabReady(key)
            }
        }, fakeDelays[key])
    })
}

const SkeletonCard = () => (
    <Card className="w-full">
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
        </CardContent>
    </Card>
)

const SkeletonProcessTree = () => (
    <Card className="w-full">
        <CardHeader>
            <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent className="h-[65vh] md:h-[65vh] 2xl:h-[78vh] p-4">
            <Skeleton className="w-full h-full rounded-lg" />
        </CardContent>
    </Card>
)

// ---- small shared UI helpers (kept local so no new dependencies are introduced) ----

function Pill({
    children,
    tone = "neutral",
}: {
    children: React.ReactNode
    tone?: "neutral" | "danger" | "warning" | "success"
}) {
    const toneClasses: Record<string, string> = {
        neutral: "bg-muted text-muted-foreground",
        danger: "bg-red-500/10 text-red-600 dark:text-red-400",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    }
    return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
            {children}
        </span>
    )
}

function StatBlock({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "danger" | "warning" }) {
    const valueTone = tone === "danger" ? "text-red-600 dark:text-red-400" : tone === "warning" ? "text-amber-600 dark:text-amber-400" : "text-foreground"
    return (
        <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className={`text-xl font-semibold ${valueTone}`}>{value}</p>
        </div>
    )
}

function KeyValueRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-start justify-between gap-4 py-1.5 border-b last:border-b-0">
            <span className="text-muted-foreground text-xs">{label}</span>
            <span className={`text-right text-xs ${mono ? "font-mono" : ""}`}>{value}</span>
        </div>
    )
}

export default function Report() {
    const { id } = useParams()
    const [loadingTabs, setLoadingTabs] = useState<Record<TabKey, boolean>>(initialLoadingState)
    const [activeTab, setActiveTab] = useState<TabKey>("overview")

    useEffect(() => {
        const signal = { cancelled: false }

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoadingTabs(initialLoadingState())

        simulateBackendStatus((readyTab) => {
            setLoadingTabs((prev) => ({ ...prev, [readyTab]: false }))
        }, signal)

        return () => {
            signal.cancelled = true
        }
    }, [id])

    const renderContent = (tab: TabKey, content: React.ReactNode, isProcessTree: boolean = false) => {
        if (loadingTabs[tab]) {
            return isProcessTree ? <SkeletonProcessTree /> : <SkeletonCard />
        }
        return content
    }

    return (
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)} className="flex flex-col items-center w-full">
            <TabsList className="w-full max-w-4xl mb-5 flex flex-wrap justify-center gap-2">
                {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5">
                        {tab.label}
                        {loadingTabs[tab.value] && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            {/* ---------------- OVERVIEW ---------------- */}
            <TabsContent value="overview" className="w-full">
                {renderContent("overview",
                    <Card className="w-full">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileCode2 className="h-5 w-5" />
                                        example.elf
                                    </CardTitle>
                                    <CardDescription>
                                        Report ID: {id ?? "a1f9c2-example"}
                                    </CardDescription>
                                </div>
                                <Pill tone="warning">suspicious</Pill>
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <StatBlock label="Suspicious probability" value="0.87" tone="warning" />
                                <StatBlock label="Heuristic score" value="7.2 / 10" tone="warning" />
                                <StatBlock label="File size" value="5.88 KB" />
                            </div>

                            <div className="rounded-lg border p-4 space-y-0.5">
                                <KeyValueRow label="Filepath" value="/home/diass/reverse/example/example.elf" mono />
                                <KeyValueRow label="SHA256" value="c3c068f16ac93413b16c33c1d794ca8c77ef47637b5fd303e698ade67e7b917b" mono />
                                <KeyValueRow label="MD5" value="fb76894b44e6ce51c0a0fefd977a80c0" mono />
                                <KeyValueRow label="Magic type" value="ELF 32-bit LSB executable, Intel i386, version 1 (SYSV)" />
                                <KeyValueRow label="MIME type" value="application/x-executable" mono />
                                <KeyValueRow label="Overall entropy" value="4.63" mono />
                                <KeyValueRow label="Build ID" value="b799eb348f3df15f6b08b3c37f8feb269a60aba7" mono />
                                <KeyValueRow label="Compiler" value="GCC 5.4.0 (Ubuntu 5.4.0-6ubuntu1~16.04.9)" />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* ---------------- RESULTS ---------------- */}
            <TabsContent value="results" className="w-full">
                {renderContent("results",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-amber-500" />
                                Scan results
                            </CardTitle>
                            <CardDescription>Combined verdict from static and ML analysis</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <StatBlock label="Verdict" value="Suspicious" tone="warning" />
                                <StatBlock label="Confidence" value="87%" tone="warning" />
                                <StatBlock label="Mitigations enabled" value="0 / 4" tone="danger" />
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-xs text-muted-foreground mb-2">Key indicators</p>
                                <ul className="space-y-1.5 text-xs list-disc pl-4">
                                    <li>Hardcoded credential-style string <span className="font-mono">super_secret_password</span> compared directly with <span className="font-mono">strcmp</span></li>
                                    <li>Gated function named <span className="font-mono">giveFlag</span> reachable only on a successful comparison</li>
                                    <li>No stack canary, NX, PIE, or RELRO — binary offers no exploit mitigations</li>
                                    <li>No network syscalls imported; behavior is local and self-contained</li>
                                </ul>
                            </div>

                            <div className="rounded-lg border p-4">
                                <p className="text-xs text-muted-foreground mb-1">Recommended action</p>
                                <p className="text-xs">
                                    Treat as a low-risk, self-contained challenge binary rather than active malware. No outbound network,
                                    persistence, or privilege-escalation behavior was observed. Flag for manual review only if it was recovered
                                    from an untrusted source.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* ---------------- ML SUMMARY ---------------- */}
            <TabsContent value="ml-summary" className="w-full">
                {renderContent("ml-summary",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FlaskConical className="h-5 w-5" />
                                ML Summary
                            </CardTitle>
                            <CardDescription>Model output for example.elf</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <StatBlock label="predicted_class" value="suspicious" tone="warning" />
                                <StatBlock label="suspicious_probability" value="0.87" tone="warning" />
                                <StatBlock label="heuristic_score" value="7.2 / 10" tone="warning" />
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1">sha256</p>
                                <p className="font-mono text-xs break-all">c3c068f16ac93413b16c33c1d794ca8c77ef47637b5fd303e698ade67e7b917b</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-2">evidence.strings</p>
                                    <div className="flex flex-col gap-1.5">
                                        {["super_secret_password", "giveFlag", "Access granted.", "Access denied.", "Usage: %s password"].map((s) => (
                                            <span key={s} className="font-mono text-xs bg-muted/50 rounded px-2 py-1">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-2">evidence.imports</p>
                                    <div className="flex flex-col gap-1.5">
                                        {["strcmp", "printf", "puts", "memset"].map((s) => (
                                            <span key={s} className="font-mono text-xs bg-muted/50 rounded px-2 py-1">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-2">features</p>
                                <div className="flex flex-wrap gap-2">
                                    <Pill tone="danger">NX: disabled</Pill>
                                    <Pill tone="danger">PIE: disabled</Pill>
                                    <Pill tone="danger">RELRO: none</Pill>
                                    <Pill tone="danger">Stack canary: none</Pill>
                                    <Pill>entropy: 4.63</Pill>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-1">summary_markdown</p>
                                <p className="text-xs leading-relaxed">
                                    32-bit statically linked ELF containing a straightforward password check. User input is compared against
                                    a hardcoded string via <span className="font-mono">strcmp</span>; a match calls <span className="font-mono">giveFlag</span>,
                                    a mismatch prints an "Access denied." message. Despite all binary security mitigations being disabled, the
                                    behavior and string set are consistent with a CTF-style challenge binary rather than real-world malware.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* ---------------- STATIC ANALYSIS ---------------- */}
            <TabsContent value="static-analysis" className="w-full">
                {renderContent("static-analysis",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Cpu className="h-5 w-5" />
                                Static Analysis
                            </CardTitle>
                            <CardDescription>ELF header, sections, symbols, and mitigations</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <StatBlock label="Architecture" value="i386" />
                                <StatBlock label="Type" value="ET_EXEC" />
                                <StatBlock label="Entry point" value="0x80483a0" />
                                <StatBlock label="Libraries" value="libc.so.6" />
                            </div>

                            <div className="rounded-lg border overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-muted-foreground text-left border-b">
                                            <th className="p-2 font-medium">Section</th>
                                            <th className="p-2 font-medium">Address</th>
                                            <th className="p-2 font-medium">Size</th>
                                            <th className="p-2 font-medium">Entropy</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: ".text", addr: "0x80483a0", size: "642 B", entropy: "6.00" },
                                            { name: ".rodata", addr: "0x8048640", size: "332 B", entropy: "2.85" },
                                            { name: ".dynstr", addr: "0x804822c", size: "118 B", entropy: "4.64" },
                                            { name: ".symtab", addr: "0x0", size: "1168 B", entropy: "2.97" },
                                            { name: ".strtab", addr: "0x0", size: "627 B", entropy: "4.91" },
                                        ].map((row) => (
                                            <tr key={row.name} className="border-b last:border-b-0">
                                                <td className="p-2 font-mono">{row.name}</td>
                                                <td className="p-2 font-mono">{row.addr}</td>
                                                <td className="p-2">{row.size}</td>
                                                <td className="p-2">{row.entropy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><KeyRound className="h-3.5 w-3.5" /> Imported symbols</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {["strcmp", "printf", "puts", "memset", "__libc_start_main", "__gmon_start__"].map((s) => (
                                            <span key={s} className="font-mono text-xs bg-muted/50 rounded px-2 py-0.5">{s}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="rounded-lg border p-3">
                                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Security mitigations</p>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between"><span>NX</span><Pill tone="danger">disabled</Pill></div>
                                        <div className="flex justify-between"><span>PIE</span><Pill tone="danger">disabled</Pill></div>
                                        <div className="flex justify-between"><span>RELRO</span><Pill tone="danger">none</Pill></div>
                                        <div className="flex justify-between"><span>Stack canary</span><Pill tone="danger">none</Pill></div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border p-3">
                                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5" /> Disassembly (entry point)</p>
                                <pre className="font-mono text-xs leading-relaxed overflow-x-auto">
{`0x80483a0  xor   ebp, ebp
0x80483a2  pop   esi
0x80483a3  mov   ecx, esp
0x80483a5  and   esp, 0xfffffff0
0x80483a8  push  eax
0x80483a9  push  esp
0x80483aa  push  edx
0x80483ab  push  0x8048620
0x80483b0  push  0x80485c0
0x80483b5  push  ecx
0x80483b6  push  esi
0x80483b7  push  0x804849b
0x80483bc  call  0x8048370  ; __libc_start_main`}
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* ---------------- ML STATIC ANALYSIS ---------------- */}
            <TabsContent value="ml-static-analysis" className="w-full">
                {renderContent("ml-static-analysis",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ListTree className="h-5 w-5" />
                                ML Static Analysis
                            </CardTitle>
                            <CardDescription>Ranked strings and imports used as model features</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm space-y-4">
                            <div className="rounded-lg border overflow-x-auto">
                                <p className="text-xs text-muted-foreground p-2 pb-0">ranked_strings</p>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-muted-foreground text-left border-b">
                                            <th className="p-2 font-medium">Value</th>
                                            <th className="p-2 font-medium">Section</th>
                                            <th className="p-2 font-medium">Offset</th>
                                            <th className="p-2 font-medium">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { value: "super_secret_password", section: ".rodata", offset: "0x8048680", score: 9.5 },
                                            { value: "giveFlag", section: ".dynsym", offset: "0x804849b", score: 8.5 },
                                            { value: "Access granted.", section: ".rodata", offset: "0x80486c0", score: 6.0 },
                                            { value: "Usage: %s password", section: ".rodata", offset: "0x8048640", score: 5.0 },
                                            { value: "Access denied.", section: ".rodata", offset: "0x80486d8", score: 4.5 },
                                        ].map((row) => (
                                            <tr key={row.value} className="border-b last:border-b-0">
                                                <td className="p-2 font-mono">{row.value}</td>
                                                <td className="p-2 font-mono">{row.section}</td>
                                                <td className="p-2 font-mono">{row.offset}</td>
                                                <td className="p-2">{row.score.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="rounded-lg border overflow-x-auto">
                                <p className="text-xs text-muted-foreground p-2 pb-0">ranked_imports</p>
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="text-muted-foreground text-left border-b">
                                            <th className="p-2 font-medium">Name</th>
                                            <th className="p-2 font-medium">Category</th>
                                            <th className="p-2 font-medium">Score</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: "strcmp", category: "comparison", score: 1.5 },
                                            { name: "printf", category: "io", score: 0.5 },
                                            { name: "puts", category: "io", score: 0.5 },
                                            { name: "memset", category: "memory", score: 0.0 },
                                            { name: "__libc_start_main", category: "runtime", score: 0.0 },
                                        ].map((row) => (
                                            <tr key={row.name} className="border-b last:border-b-0">
                                                <td className="p-2 font-mono">{row.name}</td>
                                                <td className="p-2">{row.category}</td>
                                                <td className="p-2">{row.score.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            {/* ---------------- PROCESS TREE ---------------- */}
            <TabsContent value="process-tree" className="w-full">
                {renderContent("process-tree",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HardDrive className="h-5 w-5" />
                                Process Tree
                            </CardTitle>
                            <CardDescription>example.elf did not spawn any child processes</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[65vh] md:h-[65vh] 2xl:h-[78vh] p-0">
                            <ProcessTree data={nodes} edges={edges} />
                        </CardContent>
                    </Card>,
                    true
                )}
            </TabsContent>

            {/* ---------------- YARA RULES ---------------- */}
            <TabsContent value="yara-rules" className="w-full">
                {renderContent("yara-rules",
                    <Card className="w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Network className="h-5 w-5" />
                                Generated YARA Rules
                            </CardTitle>
                            <CardDescription>Auto-generated from ranked strings and header signature</CardDescription>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <pre className="rounded-lg border bg-muted/30 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
{`rule Example_ELF_Password_Check
{
    meta:
        description = "Password-gated ELF with hardcoded secret string"
        score = 72
        predicted_class = "suspicious"
        sha256 = "c3c068f16ac93413b16c33c1d794ca8c77ef47637b5fd303e698ade67e7b917b"

    strings:
        $secret  = "super_secret_password"
        $flag    = "giveFlag"
        $granted = "Access granted."
        $denied  = "Access denied."
        $usage   = "Usage: %s password"

    condition:
        uint32(0) == 0x464c457f and
        filesize < 20KB and
        3 of ($secret, $flag, $granted, $denied, $usage)
}`}
                            </pre>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>
        </Tabs>
    )
}