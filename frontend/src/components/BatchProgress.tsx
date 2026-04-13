import { useTranslation } from 'react-i18next';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import type { BatchConversionProgress as BatchProgressType } from '../types';

interface BatchProgressProps {
  progress: BatchProgressType;
  isConverting: boolean;
}

export default function BatchProgress({ progress, isConverting }: BatchProgressProps) {
  const { t } = useTranslation();

  const percent = progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  const isComplete = progress.completed + progress.failed === progress.total && !isConverting;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t('batch.title')}
        </h3>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {isComplete ? (
            <span className="flex items-center gap-1 text-green-500">
              <CheckCircle2 className="w-4 h-4" />
              {t('batch.complete')}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              {t('batch.processing')}
            </span>
          )}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-zinc-500 dark:text-zinc-400">
          {t('batch.progress', {
            completed: progress.completed,
            total: progress.total,
          })}
        </span>
        {progress.failed > 0 && (
          <span className="flex items-center gap-1 text-red-500">
            <XCircle className="w-3.5 h-3.5" />
            {t('batch.failed', { count: progress.failed })}
          </span>
        )}
      </div>

      {/* Error Details */}
      {progress.errors.length > 0 && (
        <div className="mt-2 space-y-1">
          {progress.errors.map((err, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-red-500 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2"
            >
              <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                <strong>{err.filename}:</strong> {err.error}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
