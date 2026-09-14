export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

/**
 * The three-up level picker and the two-up theme picker. One control, driven
 * by data — subjects rename their own levels ("Basics" vs "Beginner") through
 * the subject config, not through a branch here.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  label: string;
}) {
  return (
    <div className={`seg-row seg-row-${options.length === 2 ? 2 : 3}`} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          className="seg-item"
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
