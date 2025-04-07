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

export const exportToCSV = (data: ExportData[], filename: string): void => {
  try {
    if (!data.length) {
      console.warn('No data to export');
      return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Handle special characters and wrap in quotes
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
  }
}; 