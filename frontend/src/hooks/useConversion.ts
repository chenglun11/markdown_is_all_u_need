import { useState, useCallback } from 'react';
import { convertFile, convertFiles, convertUrl } from '../lib/api';
import type { ConversionResult, BatchConversionProgress } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useConversion() {
  const { t } = useTranslation();
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<BatchConversionProgress | null>(null);

  const handleFileConvert = useCallback(
    async (file: File) => {
      setIsConverting(true);
      try {
        const res = await convertFile(file);
        setResult(res);
        toast.success(t('upload.success'));
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('upload.error');
        toast.error(`${t('upload.error')}: ${message}`);
        throw err;
      } finally {
        setIsConverting(false);
      }
    },
    [t]
  );

  const handleBatchConvert = useCallback(
    async (files: File[]) => {
      setIsConverting(true);
      setBatchProgress({
        total: files.length,
        completed: 0,
        failed: 0,
        results: [],
        errors: [],
      });

      try {
        const response = await convertFiles(files);
        setBatchProgress({
          total: files.length,
          completed: response.results.length,
          failed: response.errors.length,
          results: response.results,
          errors: response.errors,
        });
        if (response.results.length > 0) {
          setResult(response.results[0]);
        }
        toast.success(t('upload.success'));
        return response.results;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('upload.error');
        toast.error(`${t('upload.error')}: ${message}`);
        setBatchProgress((prev) =>
          prev
            ? { ...prev, failed: prev.total - prev.completed, errors: [{ filename: 'batch', error: message }] }
            : null
        );
        throw err;
      } finally {
        setIsConverting(false);
      }
    },
    [t]
  );

  const handleUrlConvert = useCallback(
    async (url: string) => {
      setIsConverting(true);
      try {
        const res = await convertUrl(url);
        setResult(res);
        toast.success(t('url.success'));
        return res;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : t('url.error');
        toast.error(`${t('url.error')}: ${message}`);
        throw err;
      } finally {
        setIsConverting(false);
      }
    },
    [t]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setBatchProgress(null);
  }, []);

  return {
    result,
    setResult,
    isConverting,
    batchProgress,
    handleFileConvert,
    handleBatchConvert,
    handleUrlConvert,
    clearResult,
  };
}
