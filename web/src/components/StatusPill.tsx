export function StatusPill({ online = true, label }: { online?: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-base-muted">
      <span
        className={`h-2 w-2 rounded-full ${online ? 'bg-status-online' : 'bg-status-critical'}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
