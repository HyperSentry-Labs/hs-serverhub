import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

/** The small in-page filter box used by Rules, Commands, Keybinds and News. */
export function ListSearchInput({ value, onChange, placeholder }: Props) {
  return (
    <div className="relative w-full sm:w-60">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-1.5 pe-3 ps-9 text-sm placeholder:text-base-muted focus:border-accent"
      />
    </div>
  );
}
