import { useMemo, useState } from "react";
import { PLACEHOLDERS } from "../../demoData";
import clsx from "clsx";

interface PlaceholderMenuProps {
  onInsert: (placeholder: string) => void;
}

const scopes = ["ALL", "CUSTOMER", "LOYALTY", "POTS", "GENERAL"] as const;

export default function PlaceholderMenu({ onInsert }: PlaceholderMenuProps) {
  const [activeScope, setActiveScope] = useState<(typeof scopes)[number]>("ALL");

  const filtered = useMemo(() => {
    if (activeScope === "ALL") return PLACEHOLDERS;
    return PLACEHOLDERS.filter((item) => item.scope === activeScope);
  }, [activeScope]);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {scopes.map((scope) => (
          <button
            key={scope}
            type="button"
            onClick={() => setActiveScope(scope)}
            className={clsx(
              "rounded-full px-3 py-1 text-xs font-medium border transition",
              activeScope === scope
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            )}
          >
            {scope === "ALL" ? "All" : scope.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.map((placeholder) => (
          <button
            key={placeholder.key}
            type="button"
            onClick={() => onInsert(placeholder.key)}
            className="px-2.5 py-1 text-xs border border-gray-200 rounded-md bg-white hover:bg-gray-50"
          >
            {placeholder.label}
          </button>
        ))}
      </div>
    </div>
  );
}
