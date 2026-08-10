export function OrDivider({ text = "or continue with" }: { text?: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-sm text-slate-400">{text}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}