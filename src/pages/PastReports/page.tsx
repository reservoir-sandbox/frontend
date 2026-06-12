import { useState } from "react"
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

interface Report {
  id: number
  filename: string
  date: string
}

export default function PastReports() {
  const [reports, setReports] = useState<Report[]>([
    { id: 1, filename: "report-2024-q1.elf", date: "01-01-2024" },
    { id: 2, filename: "report-2024-q2.elf", date: "04-01-2024" },
    { id: 3, filename: "report-2024-q3.elf", date: "07-01-2024" },
  ])
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null)

  const handleDeleteClick = (report: Report): void => {
    setReportToDelete(report)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = (): void => {
    if (reportToDelete) {
      setReports(reports.filter((report: Report) => report.id !== reportToDelete.id))
      
      console.log("Deleted report:", reportToDelete)
    }
    
    setDeleteDialogOpen(false)
    setReportToDelete(null)
  }

  const handleCancelDelete = (): void => {
    setDeleteDialogOpen(false)
    setReportToDelete(null)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Past Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Filename</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report: Report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{report.filename}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link to={`/report/${report.id}`}>
                          <DropdownMenuItem>
                            Open
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          variant="destructive"
                          onSelect={(e: Event) => {
                            e.preventDefault()
                            handleDeleteClick(report)
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
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="w-120">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Report?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{reportToDelete?.filename}"?<br />
              This action cannot be undone and the report will be permanently 
              removed from our servers.
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