import { Check } from 'lucide-react';

/**
 * Lightweight renderer for admin-editable info sections.
 * Conventions (all optional, mix freely):
 *   - blank line → paragraph break
 *   - line starting with "- " or "• " → bullet
 *   - line ending with ":" → subheading (FAQ question / group label)
 *   - **bold** for inline emphasis
 */
const renderInline = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={i} className="text-foreground font-semibold">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
};

const RichInfo = ({ text }: { text: string }) => {
  if (!text?.trim()) return null;
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const blocks: Array<
    | { type: 'p'; lines: string[] }
    | { type: 'ul'; items: string[] }
    | { type: 'h'; text: string }
  > = [];

  let currentP: string[] = [];
  let currentUl: string[] = [];

  const flushP = () => {
    if (currentP.length) {
      blocks.push({ type: 'p', lines: currentP });
      currentP = [];
    }
  };
  const flushUl = () => {
    if (currentUl.length) {
      blocks.push({ type: 'ul', items: currentUl });
      currentUl = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushP();
      flushUl();
      continue;
    }
    if (/^[-•]\s+/.test(line)) {
      flushP();
      currentUl.push(line.replace(/^[-•]\s+/, ''));
      continue;
    }
    if (/:\s*$/.test(line) && line.length < 140) {
      flushP();
      flushUl();
      blocks.push({ type: 'h', text: line.replace(/:\s*$/, '') });
      continue;
    }
    flushUl();
    currentP.push(line);
  }
  flushP();
  flushUl();

  return (
    <div className="space-y-3 text-sm font-body leading-relaxed text-muted-foreground">
      {blocks.map((b, i) => {
        if (b.type === 'h') {
          return (
            <p key={i} className="text-sm font-semibold text-foreground pt-1">
              {renderInline(b.text)}
            </p>
          );
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="space-y-2">
              {b.items.map((item, j) => (
                <li key={j} className="flex gap-2.5">
                  <Check size={14} className="mt-[3px] shrink-0 text-[hsl(var(--gold))]" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {b.lines.map((l, j) => (
              <span key={j}>
                {renderInline(l)}
                {j < b.lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default RichInfo;
