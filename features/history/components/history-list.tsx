'use client';

import { useHistory } from '../store';
import { History, Trash2, Sparkles, PlaySquare, Copy, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';

export function HistoryList() {
  const { history, isLoaded, clearHistory, deleteHistoryItem } = useHistory();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-slate-400">
        <History className="w-16 h-16 opacity-20 mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-1">No history yet</h3>
        <p className="text-center text-sm max-w-sm">
          Your recent prompts from the Prompt Engineer and Playground will appear here.
        </p>
      </div>
    );
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={clearHistory}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear History
        </button>
      </div>

      <div className="space-y-4">
        {history.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                {item.type === 'engineer' ? (
                  <div className="flex items-center gap-1.5 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Prompt Engineer
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">
                    <PlaySquare className="w-3.5 h-3.5" />
                    Playground
                  </div>
                )}
                <span className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
              <button
                onClick={() => deleteHistoryItem(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete item"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Original Prompt</h4>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-700 whitespace-pre-wrap">
                  {item.prompt}
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {item.type === 'engineer' ? 'Optimized Prompt' : 'Output'}
                  </h4>
                  {item.result && (
                    <button
                      onClick={() => copyToClipboard(item.result!, item.id)}
                      className="text-xs flex items-center gap-1 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === item.id ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                {item.result ? (
                  <div className="bg-white p-3 rounded-lg border border-slate-200 font-mono text-sm text-slate-800 whitespace-pre-wrap max-h-64 overflow-y-auto">
                    {item.type === 'engineer' ? (
                      item.result
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none">
                        <ReactMarkdown>{item.result}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-400 italic">No result recorded</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
