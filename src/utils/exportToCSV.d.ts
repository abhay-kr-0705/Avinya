export interface ExportData {
  'Registration Type': string;
  'Team Name'?: string;
  'Name': string;
  'Email': string;
  'Registration No': string;
  'Mobile No': string;
  'Semester': string;
  'Role'?: string;
  'Status': string;
  'Registration Date': string;
  'Fee Paid': number;
}

export function exportToCSV(data: ExportData[], filename: string): void; 