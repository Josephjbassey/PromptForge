import { HistoryList } from '@/features/history/components/history-list';

export default function HistoryPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prompt History</h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          View your recently generated prompts and playground outputs.
        </p>
      </div>
      
      <HistoryList />
    </div>
  );
}
