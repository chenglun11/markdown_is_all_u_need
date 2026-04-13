import axios from 'axios';
import type {
  ConversionResult,
  PaginatedHistory,
  SupportedFormat,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
});

export async function convertFile(file: File): Promise<ConversionResult> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<ConversionResult>('/convert/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function convertFiles(files: File[]): Promise<ConversionResult[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await api.post<ConversionResult[]>('/convert/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function convertUrl(url: string): Promise<ConversionResult> {
  const { data } = await api.post<ConversionResult>('/convert/url', { url });
  return data;
}

export async function getHistory(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedHistory> {
  const { data } = await api.get<PaginatedHistory>('/history', {
    params: { page, page_size: pageSize },
  });
  return data;
}

export async function getHistoryItem(id: string): Promise<ConversionResult> {
  const { data } = await api.get<ConversionResult>(`/history/${id}`);
  return data;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await api.delete(`/history/${id}`);
}

export function getDownloadUrl(id: string): string {
  return `/api/download/${id}`;
}

export async function getSupportedFormats(): Promise<SupportedFormat[]> {
  const { data } = await api.get<SupportedFormat[]>('/formats');
  return data;
}

export default api;
