import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Toaster } from 'react-hot-toast';
import { Upload, Globe, Sparkles } from 'lucide-react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import UrlConverter from './components/UrlConverter';
import MarkdownPreview from './components/MarkdownPreview';
import ConversionHistory from './components/ConversionHistory';
import BatchProgress from './components/BatchProgress';
import { useConversion } from './hooks/useConversion';
import type { ConversionResult } from './types';

type Tab = 'upload' | 'url';

function App() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('upload');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  const {
    result,
    setResult,
    isConverting,
    batchProgress,
    handleFileConvert,
    handleBatchConvert,
    handleUrlConvert,
  } = useConversion();

  const handleConversionComplete = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } finally {
      // Always refresh history, even on failure (backend may have created a record)
      setRefreshTrigger((prev) => prev + 1);
    }
  };

  const handleSelectHistoryResult = (res: ConversionResult) => {
    setResult(res);
    // Scroll to preview
    previewRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
      <Toaster
        position="top-right"
        toastOptions={{
          className: '!bg-white dark:!bg-zinc-800 !text-zinc-900 dark:!text-zinc-100 !shadow-xl !border !border-zinc-200 dark:!border-zinc-700 !rounded-xl',
          duration: 3000,
        }}
      />

      <Header />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-50 via-transparent to-transparent dark:from-violet-950/20 dark:via-transparent dark:to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-400/20 via-indigo-400/20 to-purple-400/20 dark:from-violet-600/10 dark:via-indigo-600/10 dark:to-purple-600/10 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              {t('app.subtitle')}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {t('app.title')}
            </h1>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {t('app.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload + URL */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 w-fit">
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'upload'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Upload className="w-4 h-4" />
                {t('upload.title')}
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'url'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                <Globe className="w-4 h-4" />
                {t('url.title')}
              </button>
            </div>

            {/* Upload / URL Section */}
            <div className="animate-fade-in">
              {activeTab === 'upload' ? (
                <FileUploader
                  onFileConvert={(file) =>
                    handleConversionComplete(() => handleFileConvert(file))
                  }
                  onBatchConvert={(files) =>
                    handleConversionComplete(() => handleBatchConvert(files))
                  }
                  isConverting={isConverting}
                />
              ) : (
                <UrlConverter
                  onConvert={(url) =>
                    handleConversionComplete(() => handleUrlConvert(url))
                  }
                  isConverting={isConverting}
                />
              )}
            </div>

            {/* Batch Progress */}
            {batchProgress && batchProgress.total > 1 && (
              <div className="animate-fade-in">
                <BatchProgress progress={batchProgress} isConverting={isConverting} />
              </div>
            )}

            {/* Preview Section */}
            <div ref={previewRef} className="animate-fade-in">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  {t('preview.title')}
                </h2>
                <MarkdownPreview result={result} />
              </div>
            </div>
          </div>

          {/* Right: History */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  {t('history.title')}
                </h2>
                <ConversionHistory
                  onSelectResult={handleSelectHistoryResult}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            MarkItDown Studio &mdash; Powered by{' '}
            <a
              href="https://github.com/microsoft/markitdown"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-400 transition-colors"
            >
              Microsoft MarkItDown
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
