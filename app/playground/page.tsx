import { PlaygroundForm } from '@/features/playground/components/playground-form';

export default function PlaygroundPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prompt Playground</h1>
        <p className="mt-2 text-lg text-slate-600 max-w-3xl">
          Test your prompts directly against the Gemini 3.1 Pro model. Experiment with system instructions and temperature to fine-tune your results.
        </p>
      </div>
      
      <PlaygroundForm />
    </div>
  );
}
