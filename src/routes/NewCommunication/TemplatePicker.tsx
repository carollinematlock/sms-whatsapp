import clsx from "clsx";
import { WA_TEMPLATES } from "../../demoData";

interface TemplatePickerProps {
  value?: string;
  onChange: (id: string) => void;
}

export default function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="space-y-3">
      <div className="text-xs font-medium text-gray-700">Approved templates</div>
      <div className="grid md:grid-cols-2 gap-3">
        {WA_TEMPLATES.map((template) => {
          const isActive = template.id === value;
          return (
            <button
              key={template.id}
              type="button"
              onClick={() => onChange(template.id)}
              className={clsx(
                "rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white hover:border-gray-400"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{template.name}</div>
                <span className="text-[11px] uppercase tracking-wide">
                  {template.category.toLowerCase()} · {template.language.toUpperCase()}
                </span>
              </div>
              <p className={clsx("mt-2 text-xs leading-relaxed", isActive ? "text-gray-100" : "text-gray-600")}>
                {template.body}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
