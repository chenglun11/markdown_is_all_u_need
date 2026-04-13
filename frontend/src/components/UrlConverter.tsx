import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface UrlConverterProps {
  onConvert: (url: string) => Promise<unknown>;
  isConverting: boolean;
}

export default function UrlConverter({ onConvert, isConverting }: UrlConverterProps) {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');

  const isValidUrl = (str: string): boolean => {
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    if (!isValidUrl(url)) {
      toast.error(t('url.invalidUrl'));
      return;
    }
    await onConvert(url);
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('url.placeholder')}
            disabled={isConverting}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all duration-200 text-sm disabled:opacity-50"
          />
        </div>
        <button
          type="submit"
          disabled={isConverting || !url.trim() || !isValidUrl(url)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 whitespace-nowrap"
        >
          {isConverting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('url.converting')}
            </>
          ) : (
            <>
              {t('url.convert')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
