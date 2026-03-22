'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TemplateSchema, Template } from '../schemas';
import { Save, X, Plus, Trash2, PlaySquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  template?: Template;
  onSave: (template: Template) => void;
  onCancel: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: Props) {
  const router = useRouter();
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Template>({
    resolver: zodResolver(TemplateSchema),
    defaultValues: template || {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      content: '',
      variables: [],
      createdAt: new Date().toISOString(),
    }
  });

  const content = watch('content');

  // Extract variables automatically
  useEffect(() => {
    if (content) {
      const matches = content.match(/\{([^}]+)\}/g);
      if (matches) {
        const vars = Array.from(new Set(matches.map(m => m.slice(1, -1))));
        setValue('variables', vars);
      } else {
        setValue('variables', []);
      }
    } else {
      setValue('variables', []);
    }
  }, [content, setValue]);

  const variables = watch('variables');

  const onSubmit = (data: Template) => {
    onSave(data);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          {template ? 'Edit Template' : 'New Template'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
          <input
            {...register('name')}
            className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Blog Post Generator"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
          <input
            {...register('description')}
            className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g., Generates SEO-optimized blog posts."
          />
        </div>

        <div>
          <div className="flex justify-between items-end mb-1">
            <label className="block text-sm font-medium text-slate-700">Content</label>
            <span className="text-xs text-slate-500">Use {'{variable}'} syntax for dynamic fields</span>
          </div>
          <textarea
            {...register('content')}
            className="w-full h-48 p-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm"
            placeholder="Write a blog post about {topic} for {audience}."
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
        </div>

        {variables && variables.length > 0 && (
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-900 mb-2">Detected Variables</h3>
            <div className="flex flex-wrap gap-2">
              {variables.map(v => (
                <span key={v} className="px-2.5 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full border border-indigo-200">
                  {v}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Template
          </button>
        </div>
      </form>
    </div>
  );
}
