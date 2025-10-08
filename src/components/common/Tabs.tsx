import clsx from "clsx";

export interface TabOption {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabOption[];
  activeId: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeId, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200 gap-2 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onChange(tab.id)}
          className={clsx(
            "relative px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded-t-md transition",
            activeId === tab.id
              ? "text-gray-900 bg-white border border-b-white border-gray-200 -mb-px"
              : "text-gray-500 hover:text-gray-800 border border-transparent",
            tab.disabled && "opacity-40 cursor-not-allowed"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
