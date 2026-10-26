'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useOCRReviewData,
  useSaveOCRReview,
  useDiscardOCRReview
} from '@/hooks/api';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Save,
  FileText,
  Edit3,
  CheckCircle2,
  Loader2,
  Database
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef
} from '@tanstack/react-table';
import { useAuth } from '@/contexts/AuthContext';
import type { StructuredTableData } from '@/hooks/api/useOCRReview';
import { getDummyReviewData } from '@/lib/constants/dummyData';

// Type definitions (previously from backend service)
interface TableCell {
  value: string | number;
  isEditable: boolean;
}

interface TableRow {
  cells: TableCell[];
}

// Define TypeScript interfaces for the API response
interface OCRReviewData {
  sessionId: string;
  filename: string;
  fileType: string;
  uploadedAt: string;
  ocrConfidence: string;
  processingStatus: string;
  rawText: string;
  tableData: StructuredTableData;
}

const OCRReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const { user } = useAuth();

  const { data: reviewData, isLoading, error } = useOCRReviewData(sessionId);

  const { mutate: saveReview, isPending: isSaving } = useSaveOCRReview();
  const { mutate: discardReview } = useDiscardOCRReview();

  const dummySessionReview = useMemo(() => getDummyReviewData(sessionId), [sessionId]);
  const [tableData, setTableData] = useState<StructuredTableData | null>(null);
  const [usingDummyData, setUsingDummyData] = useState<boolean>(true);

  // Initialize table data - Backend first, then dummy data
  React.useEffect(() => {
    if (reviewData?.tableData && reviewData.tableData.rows?.length > 0) {
      setTableData(reviewData.tableData);
      setUsingDummyData(false);
    } else {
      setTableData(dummySessionReview.tableData);
      setUsingDummyData(true);
    }
  }, [reviewData, dummySessionReview]);

  // Use actual review data or dummy data
  const displayReviewData: OCRReviewData = (reviewData && reviewData.tableData?.rows?.length > 0)
    ? {
      ...reviewData,
      ocrConfidence: reviewData.ocrConfidence?.toString() || "0"
    } as OCRReviewData
    : dummySessionReview as unknown as OCRReviewData;

  // Convert table data to React Table format
  const reactTableData = useMemo(() => {
    if (!tableData) return [];

    // Simple transformation: if rows are arrays, convert to objects
    if (Array.isArray(tableData.rows) && tableData.rows.length > 0) {
      if (Array.isArray(tableData.rows[0])) {
        // Convert array format to object format
        return (tableData.rows as any[][]).map((row: any[]) => {
          const rowObj: Record<string, any> = {};
          tableData.headers.forEach((header, index) => {
            rowObj[header] = row[index] || '';
          });
          return rowObj;
        });
      } else if (typeof tableData.rows[0] === 'object' && 'cells' in tableData.rows[0]) {
        // Convert cells format to object format
        return tableData.rows.map((row: any) => {
          const rowObj: Record<string, any> = {};
          Object.keys(row.cells).forEach(key => {
            rowObj[key] = row.cells[key]?.value || '';
          });
          return rowObj;
        });
      }
    }
    return tableData.rows;
  }, [tableData]);

  // Commented out - edit functionality disabled
  /*
  // Update cell data
  const updateData = (rowIndex: number, columnId: string, value: string) => {
    if (!tableData) return;

    // Simple update: mark cell as edited
    const updatedTableData = { ...tableData };
    if (Array.isArray(updatedTableData.rows[rowIndex])) {
      const columnIndex = updatedTableData.headers.indexOf(columnId);
      if (columnIndex !== -1) {
        (updatedTableData.rows[rowIndex] as any[])[columnIndex] = value;
      }
    } else if (typeof updatedTableData.rows[rowIndex] === 'object') {
      if ('cells' in updatedTableData.rows[rowIndex]) {
        updatedTableData.rows[rowIndex].cells[columnId].value = value;
      } else {
        updatedTableData.rows[rowIndex][columnId] = value;
      }
    }

    setTableData(updatedTableData);
    setHasUnsavedChanges(true);
  };
  */

  // Build columns dynamically from headers
  const columns = useMemo<ColumnDef<Record<string, string>>[]>(() => {
    if (!tableData) return [];

  return tableData.headers.map((header: string) => ({
    accessorKey: header,
    header: header,
      cell: ({ getValue }: { getValue: () => any }) => (
        <div className="w-full px-3 py-2 min-h-[36px] flex items-center">
          {getValue() as string || <span className="text-gray-400 italic">Empty</span>}
        </div>
      )
    }));
  }, [tableData]);

  const table = useReactTable({
    data: reactTableData,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  // Commented out - edit functionality disabled
  /*
  const handleSave = () => {
    if (!tableData) return;

    saveReview(
      {
        sessionId,
        tableData,
        userId: user?.id || undefined
      },
      {
        onSuccess: () => {
          setHasUnsavedChanges(false);
          router.push('/dashboard/upload-centre');
        }
      }
    );
  };
  */

  const handleDiscard = () => {
    router.push('/dashboard/upload-centre');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 font-medium">Loading OCR data for review...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (!tableData) return null;

  // Commented out - edit functionality disabled
  // const editedCellsCount = 0; // TODO: Track edited cells if needed

  return (
    <div className="min-h-screen ">
      <div className="container font-inter mx-auto p-6 space-y-6">
        {/* Back Button */}
        <button
          onClick={handleDiscard}
          className='bg-white hover:bg-gray-50 text-sm rounded-lg px-4 py-2.5 shadow-md flex justify-center items-center transition-all duration-200 hover:shadow-lg border border-gray-200 cursor-pointer'
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between flex-col lg:flex-row">
            <div className="flex flex-col lg:flex-row items-center gap-4">
              <div className="bg-secondary p-3 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-800">
                  Review OCR Results
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {displayReviewData.filename} • Uploaded {new Date(displayReviewData.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {usingDummyData && (
                <Badge variant="outline" className="bg-secondary text-secondary-foreground border-secondary px-3 py-1.5">
                  <Database className="w-3 h-3 mr-1" />
                  Demo Data
                </Badge>
              )}
              {/* Commented out - edit functionality disabled */}
              {/*
              {hasUnsavedChanges && (
                <Badge variant="outline" className="bg-secondary text-secondary-foreground border-secondary px-3 py-1.5">
                  <Edit3 className="w-3 h-3 mr-1" />
                  {editedCellsCount} changes
                </Badge>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="shadow-md hover:shadow-lg transition-all duration-200 bg-secondary text-secondary-foreground border-secondary mt-4 lg:mt-0 w-full lg:w-auto cursor-pointer  "
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
              */}
            </div>
          </div>
        </div>

        {/* Metadata Cards */}
        <div>
          <p className="font-semibold text-lg mb-3 text-gray-800">Document Information</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">File Type</p>
              <p className="font-semibold text-gray-800 truncate w-full">{displayReviewData?.fileType}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 font-inter mb-2 truncate max-w-[100px]">OCR Confidence</p>
              <Badge className={`text-white px-3 py-1 truncate max-w-[100px] rounded-md ${displayReviewData?.ocrConfidence && parseFloat(displayReviewData.ocrConfidence) > 0.9 ? 'bg-green-500' : 'bg-orange-500'
                }`}>
                90%
              </Badge>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Rows</p>
              <p className="font-semibold text-gray-800 text-xl">{tableData?.metadata?.totalRows ?? 0}</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Columns</p>
              <p className="font-semibold text-gray-800 text-xl">{tableData?.metadata?.totalCols ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Commented out - edit functionality disabled */}
        {/*
        <div className="flex items-start gap-3 bg-secondary p-4 rounded-xl shadow-sm">
          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700 leading-relaxed">
            Click any cell to edit its contents. Press <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Enter</kbd> to save or <kbd className="px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-mono">Escape</kbd> to cancel. Changes are highlighted and tracked automatically.
          </p>
        </div>
        */}

        {/* Editable Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-2 border-b border-tertiary-color  ">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg text-gray-800">Extracted Data</span>
              <Badge variant="outline" className="bg-white border-gray-300 px-3 py-1">
                {tableData?.metadata?.totalRows ?? 0} rows × {tableData?.metadata?.totalCols ?? 0} columns
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Review and edit the OCR-extracted data below
            </p>
          </div>

          <CardContent className="px-0 py-0">
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full border-collapse">
                {/* <thead className="sticky top-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 shadow-sm">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="border-b-2 text-sm border-gray-300 text-left"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead> */}
                <tbody>
                  {table.getRowModel().rows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={`border-b hover:bg-blue-50 text-sm font-inter transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="border-r last:border-r-0 border-gray-200">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </div>

        {/* Raw Text Preview */}
          {/* <details className="group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            <summary className="cursor-pointer list-none hover:bg-gray-50 transition-colors">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Raw OCR Text Preview</span>
                  <span className="text-xs text-gray-500 group-open:hidden">Click to expand ▼</span>
                  <span className="text-xs text-gray-500 hidden group-open:inline">Click to collapse ▲</span>
                </div>
              </div>
            </summary>
            <div className="px-6 pb-6">
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap border border-gray-200 text-gray-700">
                {displayReviewData.rawText}
              </pre>
            </div>
          </details> */}
      </div>
    </div>
  );
};

export default OCRReviewPage;
