'use client';

import { useState } from 'react';
import { useTemplates } from '../store';
import { TemplateEditor } from './template-editor';
import { Template } from '../schemas';
import { Plus, LayoutTemplate, Trash2, Edit2, PlaySquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function TemplateList() {
  const { templates, isLoaded, saveTemplate, deleteTemplate } = useTemplates();
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  if (!isLoaded) return null;

  const handleSave = (template: Template) => {
    saveTemplate(template);
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const handleRun = (template: Template) => {
    sessionStorage.setItem('promptforge_run_template', JSON.stringify(template));
    router.push('/playground');
  };

  if (isCreating || editingTemplate) {
    return (
      <TemplateEditor
        template={editingTemplate || undefined}
        onSave={handleSave}
        onCancel={() => {
          setIsCreating(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
          Your Templates
        </h2>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      {templates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No templates yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Create reusable prompt templates with dynamic variables to speed up your workflow.
          </p>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create your first template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(template => (
            <div key={template.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 mb-1 truncate">{template.name}</h3>
                {template.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{template.description}</p>
                )}
                
                {template.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.variables.slice(0, 3).map(v => (
                      <span key={v} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                        {v}
                      </span>
                    ))}
                    {template.variables.length > 3 && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                        +{template.variables.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingTemplate(template)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => handleRun(template)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-1.5"
                >
                  <PlaySquare className="w-3.5 h-3.5" />
                  Use
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
