import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontalIcon } from "lucide-react"
import { API_URL } from "@/utils/api"

interface Sample {
  sample_id: number
  filename: string
  uploaded_at: string
  latest_job_id: number | null
  latest_job_status: string | null
}

export default function PastReports() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [sampleToDelete, setSampleToDelete] = useState<Sample | null>(null)

  const fetchSamples = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('reservoir-bearer-token')
      const response = await fetch(`${API_URL}/samples`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.')
        }
        throw new Error(`Failed to fetch samples: ${response.status}`)
      }

      const data = await response.json()
      setSamples(data)
    } catch (err) {
      console.error('Error fetching samples:', err)
      setError(err instanceof Error ? err.message : 'Failed to load samples')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSamples()
  }, [])

  const handleDeleteClick = (sample: Sample): void => {
    setSampleToDelete(sample)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async (): Promise<void> => {
    if (!sampleToDelete) return

    try {
      const token = localStorage.getItem('reservoir-bearer-token')
      const response = await fetch(`${API_URL}/samples/${sampleToDelete.sample_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized. Please login again.')
        }
        if (response.status === 404) {
          throw new Error('Sample not found or does not belong to you.')
        }
        throw new Error(`Failed to delete sample: ${response.status}`)
      }

      setSamples(samples.filter((s: Sample) => s.sample_id !== sampleToDelete.sample_id))
      console.log("Deleted sample:", sampleToDelete)
    } catch (err) {
      console.error('Error deleting sample:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete sample')
    } finally {
      setDeleteDialogOpen(false)
      setSampleToDelete(null)
    }
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setSampleToDelete(null)
  }

  const getStatusBadge = (status: string | null) => {
    if (!status) return <span className="text-gray-400">-</span>
    
    const statusMap: Record<string, { color: string, label: string }> = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'processing': { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      'completed': { color: 'bg-green-100 text-green-800', label: 'Completed' },
      'failed': { color: 'bg-red-100 text-red-800', label: 'Failed' },
    }
    
    const statusInfo = statusMap[status.toLowerCase()] || { 
      color: 'bg-gray-100 text-gray-800', 
      label: status 
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Loading samples...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">{error}</div>
          <div className="text-center mt-4">
            <Button onClick={fetchSamples}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Past Reports</CardTitle>
        </CardHeader>
        <CardContent>
          {samples.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No samples found. Upload your first sample!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sample ID</TableHead>
                  <TableHead>Filename</TableHead>
                  <TableHead>Uploaded At</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((sample: Sample) => (
                  <TableRow key={sample.sample_id}>
                    <TableCell className="font-medium">{sample.sample_id}</TableCell>
                    <TableCell>{sample.filename}</TableCell>
                    <TableCell>{new Date(sample.uploaded_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {sample.latest_job_id ? (
                        sample.latest_job_id
                      ) : (
                        <>-</>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(sample.latest_job_status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontalIcon className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {sample.latest_job_id ? (
                            <Link to={`/report/${sample.latest_job_id}`}>
                              <DropdownMenuItem>
                                View Report
                              </DropdownMenuItem>
                            </Link>
                          ) : (
                            <DropdownMenuItem disabled>
                              No Report Available
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            variant="destructive"
                            onSelect={(e: Event) => {
                              e.preventDefault()
                              handleDeleteClick(sample)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-120">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sample?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{sampleToDelete?.filename}"?<br />
              This will remove your access to this sample. The sample itself will remain on the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}