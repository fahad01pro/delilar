import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChipOption {
  name: string;
  label: string;
  usage_count?: number;
}

interface Props {
  values: string[]; // current selected labels
  onChange: (next: string[]) => void;
  options: ChipOption[]; // available library options
  placeholder?: string;
  emptyHint?: string;
  className?: string;
  chipClassName?: string;
}

/** Premium chip/tag input with autocomplete from a library. Adds on Enter, comma, or click. */
export const ChipInput = ({
  values,
  onChange,
  options,
  placeholder = 'Type and press Enter to add',
  emptyHint,
  className,
  chipClassName,
}: Props) => {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const lowered = useMemo(() => values.map((v) => v.toLowerCase().trim()), [values]);

  const suggestions = useMemo(() => {
    const q = input.toLowerCase().trim();
    return options
      .filter((o) => !lowered.includes(o.label.toLowerCase().trim()))
      .filter((o) => !q || o.label.toLowerCase().includes(q) || o.name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [options, input, lowered]);

  const addLabel = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    if (lowered.includes(label.toLowerCase())) {
      setInput('');
      return;
    }
    onChange([...values, label]);
    setInput('');
  };

  const removeAt = (i: number) => {
    const next = [...values];
    next.splice(i, 1);
    onChange(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addLabel(input);
    } else if (e.key === 'Backspace' && !input && values.length) {
      removeAt(values.length - 1);
    }
  };

  // close suggestions on outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <div
        className="min-h-[42px] flex flex-wrap items-center gap-1.5 rounded-xl border border-border bg-background px-2 py-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20"
        onClick={() => setOpen(true)}
      >
        {values.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className={cn(
              'inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs font-body px-2.5 py-1 border border-primary/20',
              chipClassName,
            )}
          >
            {label}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeAt(i);
              }}
              className="hover:bg-primary/20 rounded-full p-0.5"
              aria-label={`Remove ${label}`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={values.length ? '' : placeholder}
          className="flex-1 min-w-[140px] bg-transparent outline-none text-sm px-1 py-0.5"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={() => addLabel(input)}
            className="text-xs font-body uppercase tracking-wider px-2 py-1 rounded-md bg-accent text-foreground hover:opacity-90 inline-flex items-center gap-1"
          >
            <Plus size={11} /> Add
          </button>
        )}
      </div>

      {open && (suggestions.length > 0 || (input.trim() && !suggestions.some((s) => s.label.toLowerCase() === input.trim().toLowerCase()))) && (
        <div className="absolute z-30 top-full left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-border bg-card shadow-premium-lg">
          {input.trim() && !options.some((o) => o.label.toLowerCase() === input.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={() => addLabel(input)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 flex items-center gap-2 border-b border-border"
            >
              <Plus size={13} /> Create <span className="font-medium">"{input.trim()}"</span>
            </button>
          )}
          {suggestions.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => addLabel(s.label)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 flex items-center justify-between"
            >
              <span>{s.label}</span>
              {typeof s.usage_count === 'number' && (
                <span className="text-[10px] text-muted-foreground font-body">{s.usage_count} uses</span>
              )}
            </button>
          ))}
          {!suggestions.length && !input.trim() && emptyHint && (
            <p className="px-3 py-3 text-xs text-muted-foreground font-body">{emptyHint}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChipInput;
