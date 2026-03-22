import { PromptEngineerForm } from '@/features/prompt-engineer/components/prompt-engineer-form';

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Prompt Engineer</h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Transform your basic ideas into highly optimized, expert-level prompts. Our AI agent analyzes your intent and structures the perfect prompt for maximum model performance.
        </p>
      </div>
      
      <PromptEngineerForm />
    </div>
  );
}
