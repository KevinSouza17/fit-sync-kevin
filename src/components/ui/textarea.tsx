import { useRef, useEffect, type TextareaHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type AutoTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxRows?: number;
};

export function AutoTextarea({
  className,
  value,
  minRows = 2,
  maxRows = 12,
  onChange,
  ...props
}: AutoTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function resize() {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
    const minH = lineHeight * minRows;
    const maxH = lineHeight * maxRows;
    const scrollH = el.scrollHeight;
    el.style.height = `${Math.min(Math.max(scrollH, minH), maxH)}px`;
    el.style.overflowY = scrollH > maxH ? "auto" : "hidden";
  }

  useEffect(() => { resize(); }, [value, minRows, maxRows]);
  useEffect(() => {
    resize();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        onChange?.(e);
        resize();
      }}
      rows={minRows}
      className={cn("resize-none transition-[height] duration-100", className)}
      {...props}
    />
  );
}
