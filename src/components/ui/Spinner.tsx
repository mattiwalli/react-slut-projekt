export default function Spinner({ label = "Laddar..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-primary animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
