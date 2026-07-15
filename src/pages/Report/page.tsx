import { useState, useEffect, useRef, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
    Loader2,
    FlaskConical,
    FileSearch,
    AlertCircle,
    AlertTriangle,
} from "lucide-react"

import {
    Card,
    CardContent,
    CardHeader
} from "@/components/ui/card"

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import StaticAnalysisReport from "@/components/StaticAnalysisReport"
import { type ReportData } from "@/components/StaticAnalysisReport/types"
import MLReport from "@/components/MLReport"
import { type MLReportData } from "@/components/MLReport/types"
import { API_URL, TOKEN_KEY } from "@/utils/api"
import type { TabKey, Job } from "./types"

const TABS: { value: TabKey; label: string; icon: React.ReactNode }[] = [
    { value: "ml", label: "ML", icon: <FlaskConical className="h-4 w-4" /> },
    { value: "static-analysis", label: "Static Analysis", icon: <FileSearch className="h-4 w-4" /> },
]

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

export default function Report() {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState<TabKey>("ml")
    const [job, setJob] = useState<Job | null>(null)
    const [staticReport, setStaticReport] = useState<ReportData | null>(null)
    const [mlReport, setMlReport] = useState<MLReportData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const isMountedRef = useRef(true)

    const [isStaticLoading, setIsStaticLoading] = useState(true)
    const [isMLLoading, setIsMLLoading] = useState(true)
    const [staticError, setStaticError] = useState<string | null>(null)
    const [mlError, setMLError] = useState<string | null>(null)

    const parseJobResults = useCallback((jobData: Job) => {
        const mlTask = jobData.tasks.find((t) => t.task_type === "ml")
        if (mlTask) {
            if (mlTask.status === "completed" && mlTask.result) {
                try {
                    const mlData = typeof mlTask.result === "string" ? JSON.parse(mlTask.result) : mlTask.result
                    if (isMountedRef.current) {
                        setMlReport(mlData as MLReportData)
                        setIsMLLoading(false)
                        setMLError(null)
                    }
                } catch (err) {
                    console.error("Failed to parse ML result:", err)
                    if (isMountedRef.current) {
                        setMLError("Failed to parse ML analysis result")
                        setIsMLLoading(false)
                    }
                }
            } else if (mlTask.status === "failed") {
                if (isMountedRef.current) {
                    setMLError(mlTask.error || "ML analysis failed")
                    setIsMLLoading(false)
                }
            } else {
                if (isMountedRef.current) {
                    setIsMLLoading(true)
                }
            }
        }

        const staticTask = jobData.tasks.find((t) => t.task_type === "static")
        if (staticTask) {
            if (staticTask.status === "completed" && staticTask.result) {
                try {
                    const staticData = typeof staticTask.result === "string" ? JSON.parse(staticTask.result) : staticTask.result
                    if (isMountedRef.current) {
                        setStaticReport(staticData.report || staticData)
                        setIsStaticLoading(false)
                        setStaticError(null)
                    }
                } catch (err) {
                    console.error("Failed to parse Static Analysis result:", err)
                    if (isMountedRef.current) {
                        setStaticError("Failed to parse static analysis result")
                        setIsStaticLoading(false)
                    }
                }
            } else if (staticTask.status === "failed") {
                if (isMountedRef.current) {
                    setStaticError(staticTask.error || "Static analysis failed")
                    setIsStaticLoading(false)
                }
            } else {
                if (isMountedRef.current) {
                    setIsStaticLoading(true)
                }
            }
        }
    }, [])

    const fetchJob = useCallback(async (): Promise<{ success: boolean; shouldContinue: boolean }> => {
        try {
            const token = localStorage.getItem(TOKEN_KEY)
            if (!token) {
                if (isMountedRef.current) {
                    setError("Authentication required. Please login.")
                    setIsLoading(false)
                }
                return { success: false, shouldContinue: false }
            }

            const response = await fetch(`${API_URL}/jobs/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            })

            if (!response.ok) {
                if (response.status === 404) {
                    if (isMountedRef.current) setError("Job not found")
                } else if (response.status === 401) {
                    if (isMountedRef.current) setError("Authentication failed. Please login again.")
                } else {
                    if (isMountedRef.current) setError(`Failed to fetch job: ${response.statusText}`)
                }
                return { success: false, shouldContinue: false }
            }

            const data: Job = await response.json()
            if (isMountedRef.current) {
                setJob(data)
                parseJobResults(data)
            }

            if (data.status === "completed" || data.status === "failed") {
                return { success: true, shouldContinue: false }
            } else {
                return { success: true, shouldContinue: true }
            }
        } catch (err) {
            console.error("Failed to fetch job:", err)
            if (isMountedRef.current) {
                setError("Network error. Please try again.")
            }
            return { success: false, shouldContinue: false }
        }
    }, [id, parseJobResults])

    const stopPolling = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
        }
    }, [])

    const startPolling = useCallback(() => {
        stopPolling()

        pollingIntervalRef.current = setInterval(async () => {
            const result = await fetchJob()
            if (!result.shouldContinue) {
                stopPolling()
            }
        }, 60000)
    }, [fetchJob, stopPolling])

    useEffect(() => {
        isMountedRef.current = true

        const initFetch = async () => {
            if (isMountedRef.current) {
                setIsLoading(true)
                setError(null)
                setIsStaticLoading(true)
                setIsMLLoading(true)
                setStaticError(null)
                setMLError(null)
            }

            const result = await fetchJob()

            if (result.shouldContinue) {
                startPolling()
            }

            if (isMountedRef.current) {
                setIsLoading(false)
            }
        }

        initFetch()

        return () => {
            isMountedRef.current = false
            stopPolling()
        }
    }, [id, fetchJob, startPolling, stopPolling])

    const renderContent = (tab: TabKey, content: React.ReactNode, dense = false) => {
        const isTabLoading = tab === "ml" ? isMLLoading : isStaticLoading
        const tabError = tab === "ml" ? mlError : staticError

        if (isTabLoading) {
            return <SkeletonCard dense={dense} />
        }

        if (tabError) {
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Analysis Error</AlertTitle>
                    <AlertDescription>{tabError}</AlertDescription>
                </Alert>
            )
        }

        return content
    }

    if (isLoading) {
        return (
            <div className="w-full">
                <SkeletonCard />
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive" className="max-w-2xl mx-auto">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    if (!job) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardContent className="py-8 text-center text-muted-foreground">No job data available</CardContent>
            </Card>
        )
    }

    return (
        <div className="w-full">
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as TabKey)}
                className="flex flex-col items-center w-full"
            >
                <TabsList className="w-full max-w-4xl mb-5 flex flex-wrap justify-center gap-2">
                    {TABS.map((tab) => {
                        const isTabLoading = tab.value === "ml" ? isMLLoading : isStaticLoading
                        const tabError = tab.value === "ml" ? mlError : staticError
                        const hasData = tab.value === "ml" ? !!mlReport : !!staticReport
                        const isDisabled = isTabLoading || !!tabError || (!hasData && !isTabLoading)

                        return (
                            <TabsTrigger
                                key={tab.value}
                                value={tab.value}
                                className="flex items-center gap-1.5"
                                disabled={isDisabled}
                            >
                                {tab.icon}
                                {tab.label}
                                {isTabLoading && (
                                    <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                                )}
                                {tabError && !isTabLoading && (
                                    <AlertTriangle className="h-3 w-3 text-red-500" />
                                )}
                                {!isTabLoading && !tabError && !hasData && (
                                    <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground">
                                        No data
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                <TabsContent value="ml" className="w-full">
                    {renderContent(
                        "ml",
                        mlReport ? (
                            <MLReport data={mlReport} />
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    ML analysis data not available
                                </CardContent>
                            </Card>
                        )
                    )}
                </TabsContent>

                <TabsContent value="static-analysis" className="w-full">
                    {renderContent(
                        "static-analysis",
                        staticReport ? (
                            <StaticAnalysisReport data={staticReport} />
                        ) : (
                            <Card>
                                <CardContent className="py-8 text-center text-muted-foreground">
                                    Static analysis data not available
                                </CardContent>
                            </Card>
                        ),
                        true
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}