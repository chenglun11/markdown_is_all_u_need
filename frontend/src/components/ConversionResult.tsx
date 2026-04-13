import type { ConversionResult } from '../types';
import FormatBadge from './FormatBadge';
import { FileText, Clock, HardDrive } from 'lucide-react';

interface ConversionResultCardProps {
  result: ConversionResult;
  onClick?: () => void;
}

export default function ConversionResultCard({ result, onClick }: ConversionResultCardProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
              {result.filename}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <FormatBadge format={result.original_format} />
            <span className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {formatFileSize(result.file_size)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(result.created_at)}
            </span>
          </div>
        </div>
      </div>

      {result.markdown_content && (
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">
          {result.markdown_content.slice(0, 200)}...
        </p>
      )}
    </div>
  );
}
