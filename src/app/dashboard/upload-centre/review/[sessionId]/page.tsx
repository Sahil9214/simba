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

// Dummy data based on the Vodka dataset
const DUMMY_TABLE_DATA: StructuredTableData = {
  headers: [
    'Sum of qty shname',
    'Flavoured Plain',
    'Green Apple',
    'Orange',
    'Lime',
    'Cranberry',
    'Watermelon',
    'Chocolate',
    'Raspberry',
    'Vanilla',
    'Saffron',
    'Grand Total'
  ],
  rows: [
    {
      id: '1',
      rowIndex: 0,
      cells: {
        'Sum of qty shname': { rowIndex: 0, colIndex: 0, value: 'N-BLOCK' },
        'Flavoured Plain': { rowIndex: 0, colIndex: 1, value: '483' },
        'Green Apple': { rowIndex: 0, colIndex: 2, value: '246' },
        'Orange': { rowIndex: 0, colIndex: 3, value: '136' },
        'Lime': { rowIndex: 0, colIndex: 4, value: '79' },
        'Cranberry': { rowIndex: 0, colIndex: 5, value: '27' },
        'Watermelon': { rowIndex: 0, colIndex: 6, value: '321' },
        'Chocolate': { rowIndex: 0, colIndex: 7, value: '32' },
        'Raspberry': { rowIndex: 0, colIndex: 8, value: '21' },
        'Vanilla': { rowIndex: 0, colIndex: 9, value: '4' },
        'Saffron': { rowIndex: 0, colIndex: 10, value: '8' },
        'Grand Total': { rowIndex: 0, colIndex: 11, value: '3063' }
      }
    },
    {
      id: '2',
      rowIndex: 1,
      cells: {
        'Sum of qty shname': { rowIndex: 1, colIndex: 0, value: 'MALVIYA NAGAR' },
        'Flavoured Plain': { rowIndex: 1, colIndex: 1, value: '505' },
        'Green Apple': { rowIndex: 1, colIndex: 2, value: '373' },
        'Orange': { rowIndex: 1, colIndex: 3, value: '71' },
        'Lime': { rowIndex: 1, colIndex: 4, value: '52' },
        'Cranberry': { rowIndex: 1, colIndex: 5, value: '15' },
        'Watermelon': { rowIndex: 1, colIndex: 6, value: '8' },
        'Chocolate': { rowIndex: 1, colIndex: 7, value: '15' },
        'Raspberry': { rowIndex: 1, colIndex: 8, value: '7' },
        'Vanilla': { rowIndex: 1, colIndex: 9, value: '6' },
        'Saffron': { rowIndex: 1, colIndex: 10, value: '1' },
        'Grand Total': { rowIndex: 1, colIndex: 11, value: '1053' }
      }
    },
    {
      id: '3',
      rowIndex: 2,
      cells: {
        'Sum of qty shname': { rowIndex: 2, colIndex: 0, value: 'SAKET SQUARE MALL' },
        'Flavoured Plain': { rowIndex: 2, colIndex: 1, value: '440' },
        'Green Apple': { rowIndex: 2, colIndex: 2, value: '272' },
        'Orange': { rowIndex: 2, colIndex: 3, value: '78' },
        'Lime': { rowIndex: 2, colIndex: 4, value: '81' },
        'Cranberry': { rowIndex: 2, colIndex: 5, value: '41' },
        'Watermelon': { rowIndex: 2, colIndex: 6, value: '23' },
        'Chocolate': { rowIndex: 2, colIndex: 7, value: '37' },
        'Raspberry': { rowIndex: 2, colIndex: 8, value: '16' },
        'Vanilla': { rowIndex: 2, colIndex: 9, value: '3' },
        'Saffron': { rowIndex: 2, colIndex: 10, value: '0' },
        'Grand Total': { rowIndex: 2, colIndex: 11, value: '991' }
      }
    },
    {
      id: '4',
      rowIndex: 3,
      cells: {
        'Sum of qty shname': { rowIndex: 3, colIndex: 0, value: 'GAZIPUR' },
        'Flavoured Plain': { rowIndex: 3, colIndex: 1, value: '308' },
        'Green Apple': { rowIndex: 3, colIndex: 2, value: '468' },
        'Orange': { rowIndex: 3, colIndex: 3, value: '60' },
        'Lime': { rowIndex: 3, colIndex: 4, value: '56' },
        'Cranberry': { rowIndex: 3, colIndex: 5, value: '39' },
        'Watermelon': { rowIndex: 3, colIndex: 6, value: '12' },
        'Chocolate': { rowIndex: 3, colIndex: 7, value: '5' },
        'Raspberry': { rowIndex: 3, colIndex: 8, value: '12' },
        'Vanilla': { rowIndex: 3, colIndex: 9, value: '0' },
        'Saffron': { rowIndex: 3, colIndex: 10, value: '0' },
        'Grand Total': { rowIndex: 3, colIndex: 11, value: '960' }
      }
    },
    {
      id: '5',
      rowIndex: 4,
      cells: {
        'Sum of qty shname': { rowIndex: 4, colIndex: 0, value: 'CHATTER PUR' },
        'Flavoured Plain': { rowIndex: 4, colIndex: 1, value: '381' },
        'Green Apple': { rowIndex: 4, colIndex: 2, value: '325' },
        'Orange': { rowIndex: 4, colIndex: 3, value: '103' },
        'Lime': { rowIndex: 4, colIndex: 4, value: '40' },
        'Cranberry': { rowIndex: 4, colIndex: 5, value: '17' },
        'Watermelon': { rowIndex: 4, colIndex: 6, value: '10' },
        'Chocolate': { rowIndex: 4, colIndex: 7, value: '24' },
        'Raspberry': { rowIndex: 4, colIndex: 8, value: '15' },
        'Vanilla': { rowIndex: 4, colIndex: 9, value: '4' },
        'Saffron': { rowIndex: 4, colIndex: 10, value: '0' },
        'Grand Total': { rowIndex: 4, colIndex: 11, value: '919' }
      }
    },
    {
      id: '6',
      rowIndex: 5,
      cells: {
        'Sum of qty shname': { rowIndex: 5, colIndex: 0, value: 'VASANT KUNJ' },
        'Flavoured Plain': { rowIndex: 5, colIndex: 1, value: '396' },
        'Green Apple': { rowIndex: 5, colIndex: 2, value: '236' },
        'Orange': { rowIndex: 5, colIndex: 3, value: '136' },
        'Lime': { rowIndex: 5, colIndex: 4, value: '61' },
        'Cranberry': { rowIndex: 5, colIndex: 5, value: '7' },
        'Watermelon': { rowIndex: 5, colIndex: 6, value: '11' },
        'Chocolate': { rowIndex: 5, colIndex: 7, value: '45' },
        'Raspberry': { rowIndex: 5, colIndex: 8, value: '8' },
        'Vanilla': { rowIndex: 5, colIndex: 9, value: '0' },
        'Saffron': { rowIndex: 5, colIndex: 10, value: '0' },
        'Grand Total': { rowIndex: 5, colIndex: 11, value: '900' }
      }
    },
    {
      id: '7',
      rowIndex: 6,
      cells: {
        'Sum of qty shname': { rowIndex: 6, colIndex: 0, value: 'EAST OF KAILASH' },
        'Flavoured Plain': { rowIndex: 6, colIndex: 1, value: '464' },
        'Green Apple': { rowIndex: 6, colIndex: 2, value: '272' },
        'Orange': { rowIndex: 6, colIndex: 3, value: '59' },
        'Lime': { rowIndex: 6, colIndex: 4, value: '39' },
        'Cranberry': { rowIndex: 6, colIndex: 5, value: '6' },
        'Watermelon': { rowIndex: 6, colIndex: 6, value: '7' },
        'Chocolate': { rowIndex: 6, colIndex: 7, value: '7' },
        'Raspberry': { rowIndex: 6, colIndex: 8, value: '5' },
        'Vanilla': { rowIndex: 6, colIndex: 9, value: '0' },
        'Saffron': { rowIndex: 6, colIndex: 10, value: '1' },
        'Grand Total': { rowIndex: 6, colIndex: 11, value: '1860' }
      }
    },
    {
      id: '8',
      rowIndex: 7,
      cells: {
        'Sum of qty shname': { rowIndex: 7, colIndex: 0, value: 'DEFENCE COLONY' },
        'Flavoured Plain': { rowIndex: 7, colIndex: 1, value: '417' },
        'Green Apple': { rowIndex: 7, colIndex: 2, value: '185' },
        'Orange': { rowIndex: 7, colIndex: 3, value: '88' },
        'Lime': { rowIndex: 7, colIndex: 4, value: '64' },
        'Cranberry': { rowIndex: 7, colIndex: 5, value: '42' },
        'Watermelon': { rowIndex: 7, colIndex: 6, value: '24' },
        'Chocolate': { rowIndex: 7, colIndex: 7, value: '7' },
        'Raspberry': { rowIndex: 7, colIndex: 8, value: '6' },
        'Vanilla': { rowIndex: 7, colIndex: 9, value: '0' },
        'Saffron': { rowIndex: 7, colIndex: 10, value: '1' },
        'Grand Total': { rowIndex: 7, colIndex: 11, value: '1834' }
      }
    },
    {
      id: '9',
      rowIndex: 8,
      cells: {
        'Sum of qty shname': { rowIndex: 8, colIndex: 0, value: 'MAHAVIR ENCLAVE' },
        'Flavoured Plain': { rowIndex: 8, colIndex: 1, value: '253' },
        'Green Apple': { rowIndex: 8, colIndex: 2, value: '142' },
        'Orange': { rowIndex: 8, colIndex: 3, value: '55' },
        'Lime': { rowIndex: 8, colIndex: 4, value: '48' },
        'Cranberry': { rowIndex: 8, colIndex: 5, value: '18' },
        'Watermelon': { rowIndex: 8, colIndex: 6, value: '15' },
        'Chocolate': { rowIndex: 8, colIndex: 7, value: '34' },
        'Raspberry': { rowIndex: 8, colIndex: 8, value: '7' },
        'Vanilla': { rowIndex: 8, colIndex: 9, value: '0' },
        'Saffron': { rowIndex: 8, colIndex: 10, value: '0' },
        'Grand Total': { rowIndex: 8, colIndex: 11, value: '797' }
      }
    }
  ],
  metadata: {
    totalRows: 9,
    totalCols: 12,
    extractedAt: new Date().toISOString()
  }
};

const DUMMY_REVIEW_DATA: OCRReviewData = {
  sessionId: "03ca14b3-805e-48c8-97ac-77e2134f50df",
  filename: "Vodka 5 months Flavoured Wise.pdf",
  fileType: "application/pdf",
  uploadedAt: "2025-10-09T14:13:40.698Z",
  ocrConfidence: "0.9962",
  processingStatus: "completed",
  rawText: "itname\n(All)\ncluster\nCorporation\nSum of qty\n",
  tableData: DUMMY_TABLE_DATA
};

// Commented out edit functionality - out of scope for now, can be enabled in future
/*
interface EditableCellProps {
  value: string;
  row: {
    index: number;
    original: Record<string, string>;
  };
  column: {
    id: string;
  };
  updateData: (rowIndex: number, columnId: string, value: string) => void;
}

const EditableCell = ({
  value: initialValue,
  row,
  column,
  updateData
}: EditableCellProps) => {
  const [value, setValue] = useState<string>(initialValue || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const onBlur = () => {
    setIsEditing(false);
    if (value !== initialValue) {
      updateData(row.index, column.id, value);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onBlur();
          } else if (e.key === 'Escape') {
            setValue(initialValue || '');
            setIsEditing(false);
          }
        }}
        autoFocus
        className="w-full px-3 py-2 border border-blue-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full px-3 py-2 cursor-text hover:bg-blue-50 rounded-md min-h-[36px] flex items-center transition-colors duration-150"
    >
      {value || <span className="text-gray-400 italic">Click to edit</span>}
    </div>
  );
};
*/

const OCRReviewPage = () => {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId as string;
  const { user } = useAuth();

  const { data: reviewData, isLoading, error } = useOCRReviewData(sessionId);

  const { mutate: saveReview, isPending: isSaving } = useSaveOCRReview();
  const { mutate: discardReview } = useDiscardOCRReview();

  const [tableData, setTableData] = useState<StructuredTableData | null>(null);
  // const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false); // Commented out - edit functionality disabled
  const [usingDummyData, setUsingDummyData] = useState<boolean>(false);

  // Initialize table data - Backend first, then dummy data
  React.useEffect(() => {
    if (reviewData?.tableData && reviewData.tableData.rows.length > 0) {
      // Backend data available with rows
      setTableData(reviewData.tableData);
      setUsingDummyData(false);
    } else if (!isLoading && (error || !reviewData || reviewData.tableData.rows.length === 0)) {
      // Backend failed or no data - use dummy data
      setTableData(DUMMY_TABLE_DATA);
      setUsingDummyData(true);
    }
  }, [reviewData, isLoading, error]);

  // Use actual review data or dummy data
  const displayReviewData: OCRReviewData = (reviewData && reviewData.tableData.rows.length > 0)
    ? {
      ...reviewData,
      ocrConfidence: reviewData.ocrConfidence?.toString() || "0"
    } as OCRReviewData
    : DUMMY_REVIEW_DATA;

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
    // Commented out - edit functionality disabled, no unsaved changes to check
    /*
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!confirmed) return;
    }
    */

    discardReview(sessionId, {
      onSuccess: () => {
        router.push('/dashboard/upload-centre');
      }
    });
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
