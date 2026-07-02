interface EligibilityMeterProps {
  possible: number;
  total: number;
}

export function EligibilityMeter({ possible, total }: EligibilityMeterProps) {
  const pct = total === 0 ? 0 : Math.round((possible / total) * 100);
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm mb-1">
        <span className="font-medium">Eligibility so far</span>
        <span className="text-gray-500">
          {possible} of {total} programs still possible
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
