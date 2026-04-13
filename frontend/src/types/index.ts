export interface ConversionResult {
  id: string;
  filename: string;
  original_format: string;
  markdown_content: string;
  file_size: number;
  created_at: string;
  title?: string;
}

export interface BatchConversionResponse {
  results: ConversionResult[];
  errors: { filename: string; error: string }[];
}

export interface ConversionHistoryItem {
  id: string;
  filename: string;
  original_format: string;
  file_size: number;
  created_at: string;
  title?: string;
}

export interface PaginatedHistory {
  items: ConversionHistoryItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SupportedFormat {
  extension: string;
  mime_type: string;
  description: string;
}

export interface BatchConversionProgress {
  total: number;
  completed: number;
  failed: number;
  results: ConversionResult[];
  errors: { filename: string; error: string }[];
}

export type Theme = 'dark' | 'light';
export type Language = 'zh' | 'en';
