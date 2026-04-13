import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Download, Code, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ConversionResult } from '../types';
import FormatBadge from './FormatBadge';
import { getDownloadUrl } from '../lib/api';

interface MarkdownPreviewProps {
  result: ConversionResult | null;
}

export default function MarkdownPreview({ result }: MarkdownPreviewProps) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!result?.markdown_content) return;
    try {
      await navigator.clipboard.writeText(result.markdown_content);
      setCopied(true);
      toast.success(t('preview.copied'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t('common.error'));
    }
  }, [result, t]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleString();
  };

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400 dark:text-zinc-600">
        <FileText className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm">{t('preview.noContent')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Metadata Bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5" />
          {result.filename}
        </span>
        <FormatBadge format={result.original_format} />
        <span>{formatFileSize(result.file_size)}</span>
        <span>{formatDate(result.created_at)}</span>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('rendered')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'rendered'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {t('preview.rendered')}
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
              viewMode === 'raw'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            {t('preview.raw')}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? t('preview.copied') : t('preview.copy')}
          </button>
          <a
            href={getDownloadUrl(result.id)}
            download
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200"
          >
            <Download className="w-4 h-4" />
            {t('preview.download')}
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {viewMode === 'rendered' ? (
          <div className="p-6 prose prose-zinc dark:prose-invert max-w-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 prose-code:text-violet-500 dark:prose-code:text-violet-400 prose-headings:font-semibold prose-a:text-violet-600 dark:prose-a:text-violet-400 prose-img:rounded-lg">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code(props) {
                  const { children, className, ...rest } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  const inline = !match;
                  return !inline ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !mt-0"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...rest}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {result.markdown_content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="relative">
            <pre className="p-6 text-sm text-zinc-300 bg-zinc-950 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-words">
              {result.markdown_content}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
