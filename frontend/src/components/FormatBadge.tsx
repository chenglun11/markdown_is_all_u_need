interface FormatBadgeProps {
  format: string;
}

const formatColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  docx: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  doc: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  xlsx: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  xls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  csv: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pptx: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  ppt: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  html: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  htm: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  jpg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  jpeg: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  png: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  gif: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  mp3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  wav: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  json: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  xml: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  zip: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  url: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
};

export default function FormatBadge({ format }: FormatBadgeProps) {
  const normalized = format.toLowerCase().replace('.', '');
  const colorClass =
    formatColors[normalized] ||
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium uppercase tracking-wider ${colorClass}`}
    >
      {normalized}
    </span>
  );
}
