"use client"

import { useState, useRef, useCallback } from "react"
import Papa from "papaparse"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import {
    Upload,
    Download,
    FileSpreadsheet,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Users
} from "lucide-react"

interface CsvRow {
    parent_email: string
    parent_first_name: string
    parent_last_name: string
    child_1_first_name: string
    child_1_last_name: string
    child_1_dob: string
    child_2_first_name: string
    child_2_last_name: string
    child_2_dob: string
    child_3_first_name: string
    child_3_last_name: string
    child_3_dob: string
    total_fee: string
    amount_paid: string
}

interface ValidationError {
    row: number
    field: string
    message: string
}

interface ImportResult {
    row: number
    parentEmail: string
    status: 'imported' | 'skipped' | 'error'
    message?: string
}

interface CsvMemberImportProps {
    groupId: string
    onImportComplete?: () => void
}

const REQUIRED_COLUMNS = [
    'parent_email', 'parent_first_name', 'parent_last_name',
    'child_1_first_name', 'child_1_last_name', 'child_1_dob',
    'child_2_first_name', 'child_2_last_name', 'child_2_dob',
    'child_3_first_name', 'child_3_last_name', 'child_3_dob',
    'total_fee', 'amount_paid'
]

function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function parseDateDMY(dateStr: string): boolean {
    if (!dateStr) return true // optional
    const parts = dateStr.split('/')
    if (parts.length !== 3) return false
    const [d, m, y] = parts.map(Number)
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2030) return false
    return true
}

export function CsvMemberImport({ groupId, onImportComplete }: CsvMemberImportProps) {
    const [parsedRows, setParsedRows] = useState<CsvRow[]>([])
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
    const [importing, setImporting] = useState(false)
    const [importResults, setImportResults] = useState<ImportResult[] | null>(null)
    const [fileName, setFileName] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    const validateRows = useCallback((rows: CsvRow[]): ValidationError[] => {
        const errors: ValidationError[] = []
        rows.forEach((row, i) => {
            const rowNum = i + 1
            if (!row.parent_email?.trim()) {
                errors.push({ row: rowNum, field: 'parent_email', message: 'Email is required' })
            } else if (!validateEmail(row.parent_email.trim())) {
                errors.push({ row: rowNum, field: 'parent_email', message: 'Invalid email format' })
            }
            if (!row.parent_first_name?.trim()) {
                errors.push({ row: rowNum, field: 'parent_first_name', message: 'First name is required' })
            }
            if (!row.parent_last_name?.trim()) {
                errors.push({ row: rowNum, field: 'parent_last_name', message: 'Last name is required' })
            }
            if (!row.child_1_first_name?.trim()) {
                errors.push({ row: rowNum, field: 'child_1_first_name', message: 'At least one child first name is required' })
            }
            // Validate DOBs
            for (let c = 1; c <= 3; c++) {
                const dob = (row as any)[`child_${c}_dob`]?.trim()
                if (dob && !parseDateDMY(dob)) {
                    errors.push({ row: rowNum, field: `child_${c}_dob`, message: `Invalid date format (use DD/MM/YYYY)` })
                }
            }
            // Validate fee values
            const totalFee = parseFloat(row.total_fee)
            if (row.total_fee && isNaN(totalFee)) {
                errors.push({ row: rowNum, field: 'total_fee', message: 'Must be a number' })
            }
            const amountPaid = parseFloat(row.amount_paid)
            if (row.amount_paid && isNaN(amountPaid)) {
                errors.push({ row: rowNum, field: 'amount_paid', message: 'Must be a number' })
            }
            if (!isNaN(totalFee) && !isNaN(amountPaid) && amountPaid > totalFee) {
                errors.push({ row: rowNum, field: 'amount_paid', message: 'Amount paid exceeds total fee' })
            }
        })
        return errors
    }, [])

    const processFile = useCallback((file: File) => {
        setImportResults(null)
        setFileName(file.name)

        Papa.parse<CsvRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Check columns
                const columns = results.meta.fields || []
                const missingColumns = REQUIRED_COLUMNS.filter(c => !columns.includes(c))

                if (missingColumns.length > 0) {
                    toast({
                        title: "Invalid CSV format",
                        description: `Missing columns: ${missingColumns.join(', ')}. Please use the template.`,
                        variant: "destructive",
                    })
                    setParsedRows([])
                    setFileName(null)
                    return
                }

                const rows = results.data.filter(row =>
                    row.parent_email?.trim() || row.parent_first_name?.trim()
                )

                setParsedRows(rows)
                setValidationErrors(validateRows(rows))
            },
            error: (error) => {
                toast({
                    title: "Failed to parse CSV",
                    description: error.message,
                    variant: "destructive",
                })
            }
        })
    }, [REQUIRED_COLUMNS, toast, validateRows])

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return
        processFile(file)

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const file = e.dataTransfer.files?.[0]
        if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
            processFile(file)
        } else {
            toast({
                title: "Invalid file type",
                description: "Please upload a CSV file.",
                variant: "destructive",
            })
        }
    }

    const handleImport = async () => {
        if (validationErrors.length > 0) {
            toast({
                title: "Fix validation errors",
                description: "Please correct the errors in your CSV before importing.",
                variant: "destructive",
            })
            return
        }

        setImporting(true)
        setImportResults(null)

        try {
            const response = await fetch(`/api/organizations/group/${groupId}/membership/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-atlas-csrf': process.env.NEXT_PUBLIC_ATLAS_CSRF_TOKEN || '',
                },
                body: JSON.stringify({ rows: parsedRows }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Import failed')
            }

            setImportResults(data.results)

            const { imported, skipped, errors } = data.summary
            toast({
                title: "Import Complete",
                description: `${imported} imported, ${skipped} skipped, ${errors} errors out of ${data.summary.total} rows.`,
                variant: errors > 0 ? "destructive" : "default",
            })

            if (imported > 0) {
                onImportComplete?.()
            }
        } catch (err: any) {
            toast({
                title: "Import Failed",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setImporting(false)
        }
    }

    const clearFile = () => {
        setParsedRows([])
        setValidationErrors([])
        setImportResults(null)
        setFileName(null)
    }

    const hasErrors = validationErrors.length > 0

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Import Members from CSV
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Upload a CSV file to bulk-import parents and their children into the membership system.
                        </CardDescription>
                    </div>
                    <a
                        href="/templates/membership_import_template.csv"
                        download="membership_import_template.csv"
                    >
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                    </a>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* File Upload */}
                {parsedRows.length === 0 ? (
                    <label
                        className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging
                            ? "border-primary bg-primary/10"
                            : "border-muted-foreground/25 bg-muted/30 hover:bg-muted/50"
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center py-6">
                            <Upload className={`h-8 w-8 mb-2 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                            <p className="text-sm text-muted-foreground">
                                <span className="font-semibold">Click to upload</span> or drag a CSV file here
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">CSV files only</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </label>
                ) : (
                    <>
                        {/* File info bar */}
                        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                            <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                                <span className="text-sm font-medium">{fileName}</span>
                                <Badge variant="secondary">{parsedRows.length} rows</Badge>
                                {hasErrors && (
                                    <Badge variant="destructive">
                                        {validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}
                                    </Badge>
                                )}
                            </div>
                            <Button variant="ghost" size="sm" onClick={clearFile}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Validation Errors */}
                        {hasErrors && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                                <p className="text-sm font-medium text-red-800 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    Validation Errors
                                </p>
                                {validationErrors.slice(0, 10).map((err, i) => (
                                    <p key={i} className="text-xs text-red-700">
                                        Row {err.row}, {err.field}: {err.message}
                                    </p>
                                ))}
                                {validationErrors.length > 10 && (
                                    <p className="text-xs text-red-600 font-medium">
                                        ... and {validationErrors.length - 10} more errors
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Preview Table */}
                        <div className="border rounded-lg overflow-auto max-h-[400px]">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="sticky top-0 bg-background">#</TableHead>
                                        <TableHead className="sticky top-0 bg-background">Parent Email</TableHead>
                                        <TableHead className="sticky top-0 bg-background">First Name</TableHead>
                                        <TableHead className="sticky top-0 bg-background">Last Name</TableHead>
                                        <TableHead className="sticky top-0 bg-background">Child 1</TableHead>
                                        <TableHead className="sticky top-0 bg-background">Child 2</TableHead>
                                        <TableHead className="sticky top-0 bg-background">Child 3</TableHead>
                                        <TableHead className="sticky top-0 bg-background text-right">Total Fee</TableHead>
                                        <TableHead className="sticky top-0 bg-background text-right">Paid</TableHead>
                                        <TableHead className="sticky top-0 bg-background text-right">Balance</TableHead>
                                        {importResults && (
                                            <TableHead className="sticky top-0 bg-background">Status</TableHead>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedRows.map((row, i) => {
                                        const rowErrors = validationErrors.filter(e => e.row === i + 1)
                                        const result = importResults?.find(r => r.row === i + 1)
                                        const totalFee = parseFloat(row.total_fee) || 0
                                        const amountPaid = parseFloat(row.amount_paid) || 0
                                        const balance = totalFee - amountPaid

                                        return (
                                            <TableRow
                                                key={i}
                                                className={rowErrors.length > 0 ? 'bg-red-50' : ''}
                                            >
                                                <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                                                <TableCell className="text-sm">{row.parent_email}</TableCell>
                                                <TableCell className="text-sm font-medium">{row.parent_first_name}</TableCell>
                                                <TableCell className="text-sm font-medium">{row.parent_last_name}</TableCell>
                                                <TableCell className="text-sm">
                                                    {row.child_1_first_name && (
                                                        <div>
                                                            <span>{row.child_1_first_name} {row.child_1_last_name}</span>
                                                            {row.child_1_dob && (
                                                                <span className="text-xs text-muted-foreground ml-1">({row.child_1_dob})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {row.child_2_first_name && (
                                                        <div>
                                                            <span>{row.child_2_first_name} {row.child_2_last_name}</span>
                                                            {row.child_2_dob && (
                                                                <span className="text-xs text-muted-foreground ml-1">({row.child_2_dob})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-sm">
                                                    {row.child_3_first_name && (
                                                        <div>
                                                            <span>{row.child_3_first_name} {row.child_3_last_name}</span>
                                                            {row.child_3_dob && (
                                                                <span className="text-xs text-muted-foreground ml-1">({row.child_3_dob})</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right text-sm">€{totalFee.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-sm">€{amountPaid.toFixed(2)}</TableCell>
                                                <TableCell className="text-right text-sm font-medium">
                                                    {balance > 0 ? (
                                                        <span className="text-amber-600">€{balance.toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-emerald-600">€0.00</span>
                                                    )}
                                                </TableCell>
                                                {importResults && (
                                                    <TableCell>
                                                        {result?.status === 'imported' && (
                                                            <Badge className="bg-green-100 text-green-700 border-green-200">
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                Imported
                                                            </Badge>
                                                        )}
                                                        {result?.status === 'skipped' && (
                                                            <Badge variant="secondary" title={result.message}>
                                                                Skipped
                                                            </Badge>
                                                        )}
                                                        {result?.status === 'error' && (
                                                            <Badge variant="destructive" title={result.message}>
                                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                                Error
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                )}
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Import Button */}
                        {!importResults && (
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleImport}
                                    disabled={importing || hasErrors}
                                    size="lg"
                                >
                                    {importing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Importing {parsedRows.length} members...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            Import {parsedRows.length} Members
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Results Summary */}
                        {importResults && (
                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-4 text-sm">
                                    <span className="text-emerald-600 font-medium">
                                        {importResults.filter(r => r.status === 'imported').length} imported
                                    </span>
                                    <span className="text-muted-foreground">
                                        {importResults.filter(r => r.status === 'skipped').length} skipped
                                    </span>
                                    <span className="text-red-600">
                                        {importResults.filter(r => r.status === 'error').length} errors
                                    </span>
                                </div>
                                <Button variant="outline" size="sm" onClick={clearFile}>
                                    Import Another File
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
