import { MessageBlock, WaTrigger } from "../../types";
import clsx from "clsx";
import { DEMO_BLOCKS, DEMO_TRIGGERS } from "../../demoData";

interface ChatbotBuilderProps {
  blocks: MessageBlock[];
  triggers: WaTrigger[];
  onBlocksChange: (blocks: MessageBlock[]) => void;
  onTriggersChange: (triggers: WaTrigger[]) => void;
}

export default function ChatbotBuilder({
  blocks,
  triggers,
  onBlocksChange,
  onTriggersChange
}: ChatbotBuilderProps) {
  const updateBlock = (id: string, patch: Partial<MessageBlock>) => {
    onBlocksChange(blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  };

  const updateButton = (blockId: string, index: number, text: string) => {
    onBlocksChange(
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        const buttons = [...(block.buttons ?? [])];
        buttons[index] = { ...buttons[index], text };
        return { ...block, buttons };
      })
    );
  };

  const addButton = (blockId: string) => {
    onBlocksChange(
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        const buttons = [...(block.buttons ?? [])];
        if (buttons.length >= 3) return block;
        buttons.push({ text: "NEW BUTTON" });
        return { ...block, buttons };
      })
    );
  };

  const removeButton = (blockId: string, index: number) => {
    onBlocksChange(
      blocks.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          buttons: (block.buttons ?? []).filter((_, idx) => idx !== index)
        };
      })
    );
  };

  const updateTrigger = (index: number, patch: Partial<WaTrigger>) => {
    onTriggersChange(
      triggers.map((trigger, idx) => (idx === index ? { ...trigger, ...patch } : trigger))
    );
  };

  const addTrigger = () => {
    onTriggersChange([
      ...triggers,
      {
        on: "KEYWORD",
        match: "NEW",
        action: "SEND_BLOCK",
        blockRef: blocks[0]?.id ?? ""
      }
    ]);
  };

  const removeTrigger = (index: number) => {
    onTriggersChange(triggers.filter((_, idx) => idx !== index));
  };

  const resetDefaults = () => {
    onBlocksChange(DEMO_BLOCKS);
    onTriggersChange(DEMO_TRIGGERS);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Mini-chatbot flow</h3>
          <p className="text-xs text-gray-500">
            Quick replies and keywords append follow-up blocks in the Preview and Inbox simulators.
          </p>
        </div>
        <button
          type="button"
          onClick={resetDefaults}
          className="text-xs text-gray-500 underline-offset-4 hover:underline"
        >
          Reset defaults
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Message blocks</div>
          <div className="space-y-3">
            {blocks.map((block) => (
              <div key={block.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">{block.id}</span>
                  <span className="text-[11px] uppercase tracking-wide text-gray-500">{block.channel}</span>
                </div>
                <textarea
                  value={block.text}
                  onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                  rows={3}
                  className="w-full rounded border border-gray-300 bg-white px-2.5 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-600 uppercase">Quick replies</span>
                    <button
                      type="button"
                      onClick={() => addButton(block.id)}
                      className={clsx(
                        "text-[11px] text-indigo-600",
                        (block.buttons ?? []).length >= 3 && "opacity-40 cursor-not-allowed"
                      )}
                      disabled={(block.buttons ?? []).length >= 3}
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {(block.buttons ?? []).length ? (
                      block.buttons!.map((button, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            value={button.text}
                            onChange={(event) => updateButton(block.id, index, event.target.value)}
                            className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeButton(block.id, index)}
                            className="text-[11px] text-rose-600 hover:text-rose-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-gray-500">No buttons configured.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">Triggers</div>
            <button type="button" onClick={addTrigger} className="text-[11px] text-indigo-600">
              Add trigger
            </button>
          </div>
          <div className="space-y-3">
            {triggers.map((trigger, index) => (
              <div key={`${trigger.on}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-gray-500">
                  <span>{trigger.on === "BUTTON_CLICK" ? "Quick reply" : "Keyword"}</span>
                  <button
                    type="button"
                    onClick={() => removeTrigger(index)}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid gap-2">
                  <label className="text-[11px] font-semibold text-gray-600">
                    Match
                    <input
                      value={trigger.match}
                      onChange={(event) => updateTrigger(index, { match: event.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                    />
                  </label>
                  <label className="text-[11px] font-semibold text-gray-600">
                    Respond with block
                    <select
                      value={trigger.blockRef}
                      onChange={(event) => updateTrigger(index, { blockRef: event.target.value })}
                      className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/20"
                    >
                      {blocks.map((block) => (
                        <option key={block.id} value={block.id}>
                          {block.id}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
