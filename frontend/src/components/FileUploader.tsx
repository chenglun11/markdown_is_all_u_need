import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Upload, FileUp, X, File as FileIcon, Loader2 } from 'lucide-react';
import FormatBadge from './FormatBadge';

interface FileUploaderProps {
  onFileConvert: (file: File) => Promise<unknown>;
  onBatchConvert: (files: File[]) => Promise<unknown>;
  isConverting: boolean;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

export default function FileUploader({
  onFileConvert,
  onBatchConvert,
  isConverting,
}: FileUploaderProps) {
  const { t } = useTranslation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((f) => f.size <= MAX_SIZE);
      if (validFiles.length < acceptedFiles.length) {
        // Some files were too large - they get filtered out
      }

      if (validFiles.length === 1 && selectedFiles.length === 0) {
        onFileConvert(validFiles[0]);
      } else {
        setSelectedFiles((prev) => [...prev, ...validFiles]);
      }
    },
    [onFileConvert, selectedFiles.length]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isConverting,
    maxSize: MAX_SIZE,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBatchConvert = async () => {
    if (selectedFiles.length > 0) {
      await onBatchConvert(selectedFiles);
      setSelectedFiles([]);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop() || 'unknown';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 group ${
          isDragActive
            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/20 scale-[1.02]'
            : isConverting
            ? 'border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 cursor-not-allowed opacity-60'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-violet-400 dark:hover:border-violet-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {isConverting ? (
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
          ) : isDragActive ? (
            <FileUp className="w-12 h-12 text-violet-500 animate-bounce" />
          ) : (
            <Upload className="w-12 h-12 text-zinc-400 dark:text-zinc-500 group-hover:text-violet-500 transition-colors duration-200" />
          )}

          <div>
            <p className="text-base font-medium text-zinc-700 dark:text-zinc-300">
              {isDragActive ? t('upload.dragActive') : isConverting ? t('upload.converting') : t('upload.dragText')}
            </p>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-500">
              {t('upload.maxSize')}
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 bg-white dark:bg-zinc-900"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileIcon className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                    {file.name}
                  </span>
                  <FormatBadge format={getFileExtension(file.name)} />
                  <span className="text-xs text-zinc-400 flex-shrink-0">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={handleBatchConvert}
            disabled={isConverting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
          >
            {isConverting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('upload.converting')}
              </span>
            ) : (
              `${t('upload.batchUpload')} (${selectedFiles.length})`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
