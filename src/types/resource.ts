export interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  uploaded_by: string;
  downloads: number;
  created_at: string;
  updated_at: string;
}

export interface ResourceStats {
  total: number;
  byCategory: Record<string, number>;
  totalDownloads: number;
}