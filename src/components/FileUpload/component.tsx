import { useEffect, useState } from "react"
import {
  formatBytes,
  useFileUpload,
  type FileWithPreview,
} from "@/hooks/use-file-upload.ts"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { CircleAlertIcon, FileTextIcon, RefreshCwIcon, UploadIcon, XIcon } from 'lucide-react'

interface FileUploadItem extends FileWithPreview {
  progress: number
  status: "uploading" | "completed" | "error"
  error?: string
}

interface ProgressUploadProps {
  maxFiles?: number
  maxSize?: number
  accept?: string
  multiple?: boolean
  className?: string
  onFilesChange?: (files: FileWithPreview[]) => void
  simulateUpload?: boolean
}

const ELF_SIGNATURE = [0x7F, 0x45, 0x4C, 0x46]

const isELFFile = async (file: File): Promise<boolean> => {
  if (!file || file.size < 4) return false

  try {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    return bytes[0] === ELF_SIGNATURE[0] &&
      bytes[1] === ELF_SIGNATURE[1] &&
      bytes[2] === ELF_SIGNATURE[2] &&
      bytes[3] === ELF_SIGNATURE[3]
  } catch (error) {
    console.error("Error reading file:", error)
    return false
  }
}

export default function Pattern({
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = ".elf,.bin,application/x-elf,application/x-binary,application/octet-stream",
  multiple = false,
  className,
  onFilesChange,
  simulateUpload = true,
}: ProgressUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<FileUploadItem[]>([])
  const [elfValidationErrors, setElfValidationErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: [],
    onFilesChange: async (newFiles) => {
      const validationErrors: string[] = []
      const validFiles: FileWithPreview[] = []

      for (const file of newFiles) {
        const isValidELF = await isELFFile(file.file)

        if (isValidELF) {
          validFiles.push(file)
        } else {
          validationErrors.push(`${file.file.name} is not a valid ELF Linux binary file`)
        }
      }

      if (validationErrors.length > 0) {
        setElfValidationErrors(validationErrors)
        setTimeout(() => setElfValidationErrors([]), 5000)
      }

      const newUploadFiles = validFiles.map((file) => {
        const existingFile = uploadFiles.find(
          (existing) => existing.id === file.id
        )

        if (existingFile) {
          return {
            ...existingFile,
            ...file,
          }
        } else {
          return {
            ...file,
            progress: 0,
            status: "uploading" as const,
          }
        }
      })

      setUploadFiles(newUploadFiles)
      onFilesChange?.(validFiles)
    },
  })

  useEffect(() => {
    if (!simulateUpload) return

    const interval = setInterval(() => {
      setUploadFiles((prev) =>
        prev.map((file) => {
          if (file.status !== "uploading") return file

          const increment = Math.random() * 15 + 5
          const newProgress = Math.min(file.progress + increment, 100)

          if (newProgress >= 100) {
            return {
              ...file,
              progress: 100,
              status: "completed" as const,
            }
          }

          return {
            ...file,
            progress: newProgress,
          }
        })
      )
    }, 500)

    return () => clearInterval(interval)
  }, [simulateUpload])

  const retryUpload = (fileId: string) => {
    setUploadFiles((prev) =>
      prev.map((file) =>
        file.id === fileId
          ? {
            ...file,
            progress: 0,
            status: "uploading" as const,
            error: undefined,
          }
          : file
      )
    )
  }

  const removeUploadFile = (fileId: string) => {
    setUploadFiles((prev) => prev.filter((file) => file.id !== fileId))
    removeFile(fileId)
  }

  const completedCount = uploadFiles.filter(
    (f) => f.status === "completed"
  ).length
  const errorCount = uploadFiles.filter((f) => f.status === "error").length
  const uploadingCount = uploadFiles.filter(
    (f) => f.status === "uploading"
  ).length

  const isSubmitDisabled = uploadFiles.length === 0 ||
    uploadingCount > 0 ||
    errorCount > 0 ||
    completedCount !== uploadFiles.length ||
    isSubmitting

  const handleSubmit = async () => {
    if (isSubmitDisabled) return
    
    setIsSubmitting(true)
    
    try {
      console.log("Submitting ELF files:", uploadFiles)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error("Submission failed:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("w-full h-full flex flex-col", className)}>
      <div className="flex-1 min-h-0">
        <div
          className={cn(
            "rounded-4xl relative border border-dashed p-8 text-center transition-colors h-full flex flex-col justify-center",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input {...getInputProps()} className="sr-only" accept=".elf,.bin,application/x-elf,application/x-binary,application/octet-stream" />

          <div className="flex flex-col items-center gap-4 p-10">
            <div
              className={cn(
                "flex h-16 w-16 items-center justify-center rounded-full",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <UploadIcon className={cn(
                "h-6",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Upload ELF Linux Binaries</h3>
              <p className="text-muted-foreground text-sm">
                Drag and drop ELF Linux files here or click to browse
              </p>
              <p className="text-muted-foreground text-xs">
                Only ELF Linux binary files are accepted. Maximum size: {formatBytes(maxSize)} each
              </p>
            </div>

            <Button onClick={openFileDialog}>
              <UploadIcon className="h-4 w-4" />
              Select ELF Files
            </Button>
          </div>
        </div>
      </div>

      {uploadFiles.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium">Upload Progress</h4>
            <div className="flex items-center gap-2">
              {completedCount > 0 && (
                <Badge variant="secondary">
                  Completed: {completedCount}
                </Badge>
              )}
              {errorCount > 0 && (
                <Badge variant="destructive">
                  Failed: {errorCount}
                </Badge>
              )}
              {uploadingCount > 0 && (
                <Badge variant="secondary">
                  Uploading: {uploadingCount}
                </Badge>
              )}
            </div>
          </div>

          <Button onClick={clearFiles} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      )}

      {uploadFiles.length > 0 && (
        <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-3">
            {uploadFiles.map((fileItem: FileUploadItem) => (
              <div
                key={fileItem.id}
                className="border-border bg-card rounded-4xl border p-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0">
                    <div className="border-border text-muted-foreground rounded-4xl flex h-12 w-12 items-center justify-center border">
                      <FileTextIcon className="size-4" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mt-0.75 flex items-center justify-between">
                      <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
                        <span className="text-sm">{fileItem.file.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatBytes(fileItem.file.size)}
                        </span>
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => removeUploadFile(fileItem.id)}
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground size-6 hover:bg-transparent hover:opacity-100"
                        >
                          <XIcon className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {fileItem.status === "uploading" && (
                      <div className="mt-2">
                        <Progress value={fileItem.progress} className="h-1" />
                      </div>
                    )}

                    {fileItem.status === "error" && fileItem.error && (
                      <Alert variant="destructive" className="mt-2 h-10 px-2 py-2 flex content-center">
                        <CircleAlertIcon className="size-4" />
                        <AlertTitle className="text-xs content-center">
                          {fileItem.error}
                        </AlertTitle>
                        <AlertAction>
                          <Button
                            onClick={() => retryUpload(fileItem.id)}
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground -mt-6 hover:bg-transparent hover:opacity-100"
                          >
                            <RefreshCwIcon className="size-3.5" />
                          </Button>
                        </AlertAction>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            <div className="flex justify-center pt-4 pb-2">
              <Button
                className="w-2xs"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
              >
                {isSubmitting ? "Submitting" : "Submit"}
                {isSubmitting && <Spinner data-icon="inline-start" />}
              </Button>
            </div>
          </div>
        </div>
      )}

      {elfValidationErrors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlertIcon />
          <AlertTitle>Invalid ELF Files</AlertTitle>
          <AlertDescription>
            {elfValidationErrors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <CircleAlertIcon />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}