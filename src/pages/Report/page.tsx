import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
    Loader2,
    FlaskConical,
    FileSearch,
} from "lucide-react"

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

import { Skeleton } from "@/components/ui/skeleton"
import StaticAnalysisReport from "@/components/StaticAnalysisReport"
import { type StaticAnalysisData } from "@/components/StaticAnalysisReport/types"

const mockStaticAnalysis: StaticAnalysisData = {
    "filename": "example.elf",
    "filepath": "/home/diass/reverse/example/example.elf",
    "file_size_bytes": 5884,
    "metadata": {
        "hashes": {
            "md5": "fb76894b44e6ce51c0a0fefd977a80c0",
            "sha1": "0c6478d8b77a11a6f42fc720d1f25a6067b1b51e",
            "sha256": "c3c068f16ac93413b16c33c1d794ca8c77ef47637b5fd303e698ade67e7b917b"
        },
        "overall_entropy": 4.626866350064491,
        "magic_type": "ELF 32-bit LSB executable, Intel i386, version 1 (SYSV)",
        "mime_type": "application/x-executable"
    },
    "header": {
        "magic": "[127, 69, 76, 70]",
        "class": "ELFCLASS32",
        "data_encoding": "ELFDATA2LSB",
        "os_abi": "ELFOSABI_SYSV",
        "type": "ET_EXEC",
        "machine": "EM_386",
        "entry_point": "0x80483a0"
    },
    "sections": [
        { "name": "", "type": "SHT_NULL", "address": "0x0", "size_bytes": 0, "entropy": 0.0 },
        { "name": ".interp", "type": "SHT_PROGBITS", "address": "0x8048134", "size_bytes": 19, "entropy": 3.6818808028034016 },
        { "name": ".note.ABI-tag", "type": "SHT_NOTE", "address": "0x8048148", "size_bytes": 32, "entropy": 1.748689844084022 },
        { "name": ".note.gnu.build-id", "type": "SHT_NOTE", "address": "0x8048168", "size_bytes": 36, "entropy": 4.136056086195821 },
        { "name": ".gnu.hash", "type": "SHT_GNU_HASH", "address": "0x804818c", "size_bytes": 32, "entropy": 1.9925416913014387 },
        { "name": ".dynsym", "type": "SHT_DYNSYM", "address": "0x80481ac", "size_bytes": 128, "entropy": 1.1942383538430357 },
        { "name": ".dynstr", "type": "SHT_STRTAB", "address": "0x804822c", "size_bytes": 118, "entropy": 4.638227599280588 },
        { "name": ".gnu.version", "type": "SHT_GNU_versym", "address": "0x80482a2", "size_bytes": 16, "entropy": 1.198192411043098 },
        { "name": ".gnu.version_r", "type": "SHT_GNU_verneed", "address": "0x80482b4", "size_bytes": 32, "entropy": 1.6605505277442498 },
        { "name": ".rel.dyn", "type": "SHT_REL", "address": "0x80482d4", "size_bytes": 8, "entropy": 2.5 },
        { "name": ".rel.plt", "type": "SHT_REL", "address": "0x80482dc", "size_bytes": 40, "entropy": 3.33048202372184 },
        { "name": ".init", "type": "SHT_PROGBITS", "address": "0x8048304", "size_bytes": 35, "entropy": 3.9217212310452396 },
        { "name": ".plt", "type": "SHT_PROGBITS", "address": "0x8048330", "size_bytes": 96, "entropy": 3.5581074760360023 },
        { "name": ".plt.got", "type": "SHT_PROGBITS", "address": "0x8048390", "size_bytes": 8, "entropy": 3.0 },
        { "name": ".text", "type": "SHT_PROGBITS", "address": "0x80483a0", "size_bytes": 642, "entropy": 6.003163550263331 },
        { "name": ".fini", "type": "SHT_PROGBITS", "address": "0x8048624", "size_bytes": 20, "entropy": 3.821928094887362 },
        { "name": ".rodata", "type": "SHT_PROGBITS", "address": "0x8048640", "size_bytes": 332, "entropy": 2.848317842486524 },
        { "name": ".eh_frame_hdr", "type": "SHT_PROGBITS", "address": "0x804878c", "size_bytes": 52, "entropy": 3.28394274032146 },
        { "name": ".eh_frame", "type": "SHT_PROGBITS", "address": "0x80487c0", "size_bytes": 248, "entropy": 4.747237987277383 },
        { "name": ".init_array", "type": "SHT_INIT_ARRAY", "address": "0x80498b8", "size_bytes": 4, "entropy": 2.0 },
        { "name": ".fini_array", "type": "SHT_FINI_ARRAY", "address": "0x80498bc", "size_bytes": 4, "entropy": 2.0 },
        { "name": ".jcr", "type": "SHT_PROGBITS", "address": "0x80498c0", "size_bytes": 4, "entropy": 0.0 },
        { "name": ".dynamic", "type": "SHT_DYNAMIC", "address": "0x80498c4", "size_bytes": 240, "entropy": 2.8595669544764335 },
        { "name": ".got", "type": "SHT_PROGBITS", "address": "0x80499b4", "size_bytes": 4, "entropy": 0.0 },
        { "name": ".got.plt", "type": "SHT_PROGBITS", "address": "0x80499b8", "size_bytes": 32, "entropy": 2.9178377974034158 },
        { "name": ".data", "type": "SHT_PROGBITS", "address": "0x80499d8", "size_bytes": 8, "entropy": 0.0 },
        { "name": ".bss", "type": "SHT_NOBITS", "address": "0x80499e0", "size_bytes": 4, "entropy": 0.0 },
        { "name": ".comment", "type": "SHT_PROGBITS", "address": "0x0", "size_bytes": 52, "entropy": 4.159305766459983 },
        { "name": ".shstrtab", "type": "SHT_STRTAB", "address": "0x0", "size_bytes": 266, "entropy": 4.2871406668284235 },
        { "name": ".symtab", "type": "SHT_SYMTAB", "address": "0x0", "size_bytes": 1168, "entropy": 2.9733632734640607 },
        { "name": ".strtab", "type": "SHT_STRTAB", "address": "0x0", "size_bytes": 627, "entropy": 4.905830617662472 }
    ],
    "segments": [
        { "type": "PT_PHDR", "virtual_address": "0x8048034", "memory_size_bytes": 256, "flags": "0x5" },
        { "type": "PT_INTERP", "virtual_address": "0x8048134", "memory_size_bytes": 19, "flags": "0x4" },
        { "type": "PT_LOAD", "virtual_address": "0x8048000", "memory_size_bytes": 2232, "flags": "0x5" },
        { "type": "PT_LOAD", "virtual_address": "0x80498b8", "memory_size_bytes": 300, "flags": "0x6" },
        { "type": "PT_DYNAMIC", "virtual_address": "0x80498c4", "memory_size_bytes": 240, "flags": "0x6" },
        { "type": "PT_NOTE", "virtual_address": "0x8048148", "memory_size_bytes": 68, "flags": "0x4" },
        { "type": "PT_GNU_EH_FRAME", "virtual_address": "0x804878c", "memory_size_bytes": 52, "flags": "0x4" },
        { "type": "PT_GNU_STACK", "virtual_address": "0x0", "memory_size_bytes": 0, "flags": "0x7" }
    ],
    "libraries": ["libc.so.6"],
    "symbols": {
        "imported": [
            { "name": "strcmp", "value": "0x0", "type": "STT_FUNC", "bind": "STB_GLOBAL" },
            { "name": "printf", "value": "0x0", "type": "STT_FUNC", "bind": "STB_GLOBAL" },
            { "name": "puts", "value": "0x0", "type": "STT_FUNC", "bind": "STB_GLOBAL" },
            { "name": "__gmon_start__", "value": "0x0", "type": "STT_NOTYPE", "bind": "STB_WEAK" },
            { "name": "__libc_start_main", "value": "0x0", "type": "STT_FUNC", "bind": "STB_GLOBAL" },
            { "name": "memset", "value": "0x0", "type": "STT_FUNC", "bind": "STB_GLOBAL" }
        ],
        "exported": [
            { "name": "_IO_stdin_used", "value": "0x8048644", "type": "STT_OBJECT", "bind": "STB_GLOBAL" }
        ],
        "internal": []
    },
    "disassembly": {
        "architecture": 3,
        "mode": 4,
        "entry_point_vaddr": "0x80483a0",
        "instructions": [
            { "address": "0x80483a0", "mnemonic": "xor", "op_str": "ebp, ebp", "bytes": "31ed" },
            { "address": "0x80483a2", "mnemonic": "pop", "op_str": "esi", "bytes": "5e" },
            { "address": "0x80483a3", "mnemonic": "mov", "op_str": "ecx, esp", "bytes": "89e1" },
            { "address": "0x80483a5", "mnemonic": "and", "op_str": "esp, 0xfffffff0", "bytes": "83e4f0" },
            { "address": "0x80483a8", "mnemonic": "push", "op_str": "eax", "bytes": "50" },
            { "address": "0x80483a9", "mnemonic": "push", "op_str": "esp", "bytes": "54" },
            { "address": "0x80483aa", "mnemonic": "push", "op_str": "edx", "bytes": "52" },
            { "address": "0x80483ab", "mnemonic": "push", "op_str": "0x8048620", "bytes": "6820860408" },
            { "address": "0x80483b0", "mnemonic": "push", "op_str": "0x80485c0", "bytes": "68c0850408" },
            { "address": "0x80483b5", "mnemonic": "push", "op_str": "ecx", "bytes": "51" },
            { "address": "0x80483b6", "mnemonic": "push", "op_str": "esi", "bytes": "56" },
            { "address": "0x80483b7", "mnemonic": "push", "op_str": "0x804849b", "bytes": "689b840408" },
            { "address": "0x80483bc", "mnemonic": "call", "op_str": "0x8048370", "bytes": "e8afffffff" },
            { "address": "0x80483c1", "mnemonic": "hlt", "op_str": "", "bytes": "f4" },
            { "address": "0x80483d0", "mnemonic": "mov", "op_str": "ebx, dword ptr [esp]", "bytes": "8b1c24" },
            { "address": "0x80483d3", "mnemonic": "ret", "op_str": "", "bytes": "c3" },
            { "address": "0x80483e0", "mnemonic": "mov", "op_str": "eax, 0x80499e3", "bytes": "b8e3990408" },
            { "address": "0x80483e5", "mnemonic": "sub", "op_str": "eax, 0x80499e0", "bytes": "2de0990408" },
            { "address": "0x80483ea", "mnemonic": "cmp", "op_str": "eax, 6", "bytes": "83f806" },
            { "address": "0x80483ed", "mnemonic": "jbe", "op_str": "0x8048409", "bytes": "761a" },
            { "address": "0x80483ef", "mnemonic": "mov", "op_str": "eax, 0", "bytes": "b800000000" },
            { "address": "0x80483f4", "mnemonic": "test", "op_str": "eax, eax", "bytes": "85c0" },
            { "address": "0x80483f6", "mnemonic": "je", "op_str": "0x8048409", "bytes": "7411" },
            { "address": "0x80483f8", "mnemonic": "push", "op_str": "ebp", "bytes": "55" },
            { "address": "0x80483f9", "mnemonic": "mov", "op_str": "ebp, esp", "bytes": "89e5" },
            { "address": "0x80483fb", "mnemonic": "sub", "op_str": "esp, 0x14", "bytes": "83ec14" },
            { "address": "0x80483fe", "mnemonic": "push", "op_str": "0x80499e0", "bytes": "68e0990408" },
            { "address": "0x8048403", "mnemonic": "call", "op_str": "eax", "bytes": "ffd0" },
            { "address": "0x8048405", "mnemonic": "add", "op_str": "esp, 0x10", "bytes": "83c410" },
            { "address": "0x8048408", "mnemonic": "leave", "op_str": "", "bytes": "c9" },
            { "address": "0x8048409", "mnemonic": "repz ret", "op_str": "", "bytes": "f3c3" }
        ]
    },
    "strings_analysis": {
        "total_unique_strings_found": 72,
        "strings": [
            "__init_array_start", "memset", "__libc_start_main@@GLIBC_2.0", "frame_dummy",
            ".eh_frame_hdr", ".got.plt", "_Jv_RegisterClasses", ".dynsym",
            "_ITM_registerTMCloneTable", "strcmp", "printf", "__x86.get_pc_thunk.bx",
            "strcmp@@GLIBC_2.0", "__libc_start_main", "GLIBC_2.0", "conditional1.c",
            "__libc_csu_init", "GCC: (Ubuntu 5.4.0-6ubuntu1~16.04.9) 5.4.0 20160609",
            "_fp_hw", ".gnu.version_r", ".plt.got", "_GLOBAL_OFFSET_TABLE_", ".shstrtab",
            "memset@@GLIBC_2.0", ".comment", "_IO_stdin_used", "__gmon_start__",
            "__do_global_dtors_aux_fini_array_entry", "libc.so.6", ".note.ABI-tag",
            "completed.7209", ".dynstr", "_DYNAMIC", "super_secret_password",
            ".gnu.version", "__FRAME_END__", "__JCR_END__", "__libc_csu_fini",
            "_ITM_deregisterTMCloneTable", "Usage: %s password", ".rel.dyn",
            "giveFlag", "Access granted.", ".strtab", "/lib/ld-linux.so.2",
            ".init_array", ".eh_frame", ".gnu.hash", "__bss_start",
            "__do_global_dtors_aux", "__TMC_END__", "__JCR_LIST__",
            "__frame_dummy_init_array_entry", ".symtab", ";*2$\"(",
            "printf@@GLIBC_2.0", "Access denied.", "__dso_handle",
            ".note.gnu.build-id", ".rodata", ".fini_array", ".dynamic",
            ".interp", "__data_start", "/usr/local/lib:$ORIGIN", "crtstuff.c",
            "puts@@GLIBC_2.0", ".rel.plt", "deregister_tm_clones",
            "__GNU_EH_FRAME_HDR", "_edata", "__init_array_end"
        ],
        "truncated": false
    },
    "security_mitigations": {
        "nx": false,
        "pie": false,
        "relro": "No RELRO",
        "stack_canary": false
    },
    "build_id": "b799eb348f3df15f6b08b3c37f8feb269a60aba7",
    "compiler_info": ["GCC: (Ubuntu 5.4.0-6ubuntu1~16.04.9) 5.4.0 20160609"]
}

const TAB_KEYS = [
    "ml",
    "static-analysis",
] as const

type TabKey = typeof TAB_KEYS[number]

const TABS: { value: TabKey, label: string, icon: React.ReactNode }[] = [
    { value: "ml", label: "ML", icon: <FlaskConical className="h-4 w-4" /> },
    { value: "static-analysis", label: "Static Analysis", icon: <FileSearch className="h-4 w-4" /> },
]

const initialLoadingState = (): Record<TabKey, boolean> =>
    TAB_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {} as Record<TabKey, boolean>)

function simulateBackendStatus(
    onTabReady: (tab: TabKey) => void,
    signal: { cancelled: boolean }
) {
    const fakeDelays: Record<TabKey, number> = {
        "ml": 1500,
        "static-analysis": 2000,
    }

    TAB_KEYS.forEach((key) => {
        setTimeout(() => {
            if (!signal.cancelled) {
                onTabReady(key)
            }
        }, fakeDelays[key])
    })
}

const SkeletonCard = ({ dense = false }: { dense?: boolean }) => (
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
            {dense && (
                <>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </>
            )}
        </CardContent>
    </Card>
)

const LoremIpsumContent = ({ title, description }: { title: string; description: string }) => (
    <Card className="w-full">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
            <p className="text-muted-foreground">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="text-muted-foreground">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Feature 1</p>
                    <p className="text-lg font-semibold">Lorem</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Feature 2</p>
                    <p className="text-lg font-semibold">Ipsum</p>
                </div>
                <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground">Feature 3</p>
                    <p className="text-lg font-semibold">Dolor</p>
                </div>
            </div>
            <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground mb-2">Details</p>
                <ul className="space-y-1.5 text-xs list-disc pl-4 text-muted-foreground">
                    <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit</li>
                    <li>Sed do eiusmod tempor incididunt ut labore et dolore</li>
                    <li>Ut enim ad minim veniam, quis nostrud exercitation</li>
                    <li>Duis aute irure dolor in reprehenderit in voluptate</li>
                </ul>
            </div>
        </CardContent>
    </Card>
)

export default function Report() {
    const { id } = useParams()
    const [loadingTabs, setLoadingTabs] = useState<Record<TabKey, boolean>>(initialLoadingState)
    const [activeTab, setActiveTab] = useState<TabKey>("ml")

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

    const renderContent = (tab: TabKey, content: React.ReactNode, dense = false) => {
        if (loadingTabs[tab]) {
            return <SkeletonCard dense={dense} />
        }
        return content
    }

    return (
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabKey)} className="flex flex-col items-center w-full">
            <TabsList className="w-full max-w-4xl mb-5 flex flex-wrap justify-center gap-2">
                {TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-1.5">
                        {tab.icon}
                        {tab.label}
                        {loadingTabs[tab.value] && (
                            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="ml" className="w-full">
                {renderContent("ml", <LoremIpsumContent title="ML Analysis" description="Machine learning model results" />)}
            </TabsContent>

            <TabsContent value="static-analysis" className="w-full">
                {renderContent("static-analysis", <StaticAnalysisReport data={mockStaticAnalysis} />, true)}
            </TabsContent>
        </Tabs>
    )
}