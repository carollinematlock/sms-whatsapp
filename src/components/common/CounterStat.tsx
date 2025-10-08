interface CounterStatProps {
  label: string;
  value: number;
}

export default function CounterStat({ label, value }: CounterStatProps) {
  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3 text-center bg-white">
      <div className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</div>
      <div className="text-xs uppercase tracking-wide text-gray-500 mt-1">{label}</div>
    </div>
  );
}
