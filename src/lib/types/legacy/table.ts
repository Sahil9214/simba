export type Status = "Processed" | "cancelled" | "Processing";
export type FileType = "Excel File" | "Word Document" | "PDF File";

export interface FileRow {
    id: string;
    name: string;
    type: FileType;
    country: string;
    role: string;
    date: string; // dd/mm/yyyy
    status: Status;
}
