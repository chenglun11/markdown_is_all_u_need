import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { History, Trash2, Eye, Loader2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { getHistory, getHistoryItem, deleteHistoryItem } from '../lib/api';
import type { ConversionHistoryItem, ConversionResult } from '../types';
import FormatBadge from './FormatBadge';

interface ConversionHistoryProps {
  onSelectResult: (result: ConversionResult) => void;
  refreshTrigger?: number;
}

export default function ConversionHistory({
  onSelectResult,
  refreshTrigger,
}: ConversionHistoryProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<ConversionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadHistory = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      setLoading(true);
      try {
        const data = await getHistory(pageNum, 10);
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setTotalPages(data.total_pages);
        setTotal(data.total);
        setPage(pageNum);
      } catch {
        // Silent fail on initial load
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadHistory(1);
  }, [loadHistory, refreshTrigger]);

  const handleView = async (id: string) => {
    try {
      const result = await getHistoryItem(id);
      onSelectResult(result);
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('history.deleteConfirm'))) return;
    try {
      await deleteHistoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
      toast.success(t('history.deleted'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  const handleLoadMore = () => {
    if (page < totalPages) {
      loadHistory(page + 1, true);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('history.justNow');
    if (diffMins < 60) return t('history.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('history.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('history.daysAgo', { count: diffDays });
    return date.toLocaleDateString();
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
        <p className="text-sm text-zinc-400 dark:text-zinc-600">{t('history.empty')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <History className="w-4 h-4" />
          {t('history.total', { count: total })}
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {item.filename}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <FormatBadge format={item.original_format} />
                  <span className="text-xs text-zinc-400">
                    {formatFileSize(item.file_size)}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatDate(item.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => handleView(item.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
                title={t('history.view')}
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title={t('history.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {page < totalPages && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors flex items-center justify-center gap-1"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {t('history.loadMore')}
            </>
          )}
        </button>
      )}
    </div>
  );
}
