interface StepperProps {
  steps: string[];
  activeIndex: number;
}

export default function Stepper({ steps, activeIndex }: StepperProps) {
  return (
    <ol className="flex flex-wrap gap-3 text-sm mb-6">
      {steps.map((label, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <li
            key={label}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-full border transition",
              isActive && "bg-gray-900 text-white border-gray-900",
              isComplete && "bg-emerald-100 text-emerald-900 border-emerald-200",
              !isActive && !isComplete && "bg-white border-gray-200 text-gray-600"
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="font-semibold">{index + 1}</span>
            <span>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
