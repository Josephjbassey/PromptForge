'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlaygroundRequestSchema, PlaygroundRequest, PlaygroundResponse } from '../schemas';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Play, Settings2, Variable, Terminal, Save, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Template } from '@/features/templates/schemas';
import { useTemplates } from '@/features/templates/store';
import { useHistory } from '@/features/history/store';

export function PlaygroundForm() {
  const [result, setResult] = useState<PlaygroundResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const { saveTemplate } = useTemplates();
  const { addHistoryItem } = useHistory();

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting, errors } } = useForm<PlaygroundRequest>({
    resolver: zodResolver(PlaygroundRequestSchema),
    defaultValues: {
      temperature: 1,
    }
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('promptforge_run_template');
    if (stored) {
      try {
        const t = JSON.parse(stored) as Template;
        setTemplate(t);
        setValue('prompt', t.content);
        
        // Initialize variable values
        const initialVars: Record<string, string> = {};
        t.variables.forEach(v => initialVars[v] = '');
        setVariableValues(initialVars);
        
        sessionStorage.removeItem('promptforge_run_template');
      } catch (e) {
        console.error(e);
      }
    }
  }, [setValue]);

  const temperature = watch('temperature');
  const promptContent = watch('prompt');

  // Update prompt when variables change
  useEffect(() => {
    if (template) {
      let newPrompt = template.content;
      Object.entries(variableValues).forEach(([key, val]) => {
        if (val) {
          // Replace all instances of {key} with val
          const regex = new RegExp(`\\{${key}\\}`, 'g');
          newPrompt = newPrompt.replace(regex, val);
        }
      });
      setValue('prompt', newPrompt);
    }
  }, [variableValues, template, setValue]);

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveTemplate = () => {
    if (promptContent && promptContent.trim().length > 0) {
      // Extract variables using regex \{([^}]+)\}
      const matches = Array.from(promptContent.matchAll(/\{([^}]+)\}/g));
      const extractedVariables = Array.from(new Set(matches.map(m => m[1])));

      const newTemplate = {
        id: crypto.randomUUID(),
        name: `Playground Prompt ${new Date().toLocaleDateString()}`,
        description: 'Saved from Playground',
        content: promptContent,
        variables: extractedVariables,
        createdAt: new Date().toISOString(),
      };
      saveTemplate(newTemplate);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const onSubmit = async (data: PlaygroundRequest) => {
    setError(null);
    setResult(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: data.prompt,
        config: {
          systemInstruction: data.systemInstruction || undefined,
          temperature: data.temperature,
        },
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      setResult({
        text: response.text,
        usage: response.usageMetadata ? {
          promptTokenCount: response.usageMetadata.promptTokenCount,
          candidatesTokenCount: response.usageMetadata.candidatesTokenCount,
          totalTokenCount: response.usageMetadata.totalTokenCount,
        } : undefined
      });
      
      addHistoryItem({
        type: 'playground',
        prompt: data.prompt,
        result: response.text,
      });
    } catch (err) {
      console.error("Error testing prompt:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" />
            Configuration
          </h2>
          <form id="playground-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">System Instruction (Optional)</label>
              <textarea
                {...register('systemInstruction')}
                className="w-full h-24 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
                placeholder="e.g., You are a helpful coding assistant."
              />
            </div>
            
            {template && template.variables.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Variable className="w-4 h-4 text-indigo-500" />
                  Template Variables
                </h3>
                {template.variables.map(v => (
                  <div key={v}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">{v}</label>
                    <input
                      type="text"
                      value={variableValues[v] || ''}
                      onChange={(e) => handleVariableChange(v, e.target.value)}
                      className="w-full p-2 text-sm rounded-md border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder={`Value for ${v}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Prompt</label>
                {!template && (
                  <button
                    type="button"
                    onClick={handleSaveTemplate}
                    disabled={!promptContent || promptContent.trim().length === 0}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 disabled:opacity-50 disabled:hover:text-indigo-600"
                  >
                    {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {saved ? 'Saved' : 'Save as Template'}
                  </button>
                )}
              </div>
              <textarea
                {...register('prompt')}
                className="w-full h-48 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
                placeholder="Enter your prompt here..."
                readOnly={!!template}
              />
              {errors.prompt && <p className="text-red-500 text-sm mt-1">{errors.prompt.message}</p>}
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Temperature</label>
                <span className="text-sm text-slate-500 font-mono">{temperature}</span>
              </div>
              <input
                {...register('temperature', { valueAsNumber: true })}
                type="range"
                min="0"
                max="2"
                step="0.1"
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>
          </form>
        </div>
        
        <button
          form="playground-form"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {isSubmitting ? 'Running...' : 'Run Prompt'}
        </button>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
            {error}
          </div>
        )}
      </div>

      <div className="lg:col-span-7">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Output
            </h3>
            {result?.usage && (
              <div className="flex gap-3 text-xs text-slate-500 font-mono">
                <span title="Prompt Tokens">P: {result.usage.promptTokenCount}</span>
                <span title="Candidate Tokens">C: {result.usage.candidatesTokenCount}</span>
                <span title="Total Tokens" className="font-semibold text-slate-700">T: {result.usage.totalTokenCount}</span>
              </div>
            )}
          </div>
          <div className="p-6 flex-1 overflow-auto bg-white prose prose-slate max-w-none">
            {result ? (
              <div className="markdown-body">
                <ReactMarkdown>{result.text}</ReactMarkdown>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                <Play className="w-12 h-12 opacity-20" />
                <p className="text-center text-sm">
                  Run a prompt to see the model&apos;s response here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
