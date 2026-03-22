import { TemplateList } from '@/features/templates/components/template-list';

export default function TemplatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prompt Templates</h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Build and manage reusable prompt templates. Use {'{variable}'} syntax to create dynamic fields that you can fill in later.
        </p>
      </div>
      
      <TemplateList />
    </div>
  );
}
