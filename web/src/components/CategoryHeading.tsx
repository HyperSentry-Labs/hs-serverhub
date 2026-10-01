export function CategoryHeading({ label, count }: { label: string; count: number }) {
  return (
    <h3 className="mb-2 mt-5 flex items-baseline gap-2 text-[11px] font-semibold uppercase tracking-wider text-base-muted first:mt-0">
      {label}
      <span className="font-mono font-normal normal-case tracking-normal text-base-muted/70">{count}</span>
    </h3>
  );
}
