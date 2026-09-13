import { cn } from "@/lib/utils";

const SIZE_CLASSES = {
  sm: "w-3.5 h-3.5 border-2",
  md: "w-5 h-5 border-2",
  lg: "w-8 h-8 border-[3px]",
} as const;

/**
 * A smooth, color-inheriting loading spinner. Uses `border-current` so it
 * automatically matches whatever text color it's placed in (white on a
 * maroon button, slate on a light background, etc) instead of needing a
 * hardcoded color per usage.
 */
export function Spinner({
  size = "md",
  className,
}: {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn(
        "inline-block shrink-0 rounded-full border-current border-t-transparent animate-spin motion-reduce:animate-pulse",
        SIZE_CLASSES[size],
        className
      )}
    />
  );
}
