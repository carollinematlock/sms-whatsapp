import { useMemo, useState } from "react";
import Card from "../../components/common/Card";
import PlaceholderMenu from "../../components/common/PlaceholderMenu";
import MediaPicker from "../../components/common/MediaPicker";
import TemplatePicker from "./TemplatePicker";
import ChatbotBuilder from "./ChatbotBuilder";
import { SEGMENTS, SENDERS, WA_TEMPLATES } from "../../demoData";
import { useCommsStore } from "../../store/useCommsStore";
import { validateMms } from "../../services/mms";
import { newId } from "../../utils/id";

interface Props {
  onNext: () => void;
}

export default function Step1ComposeWhatsApp({ onNext }: Props) {
  const { wizard, updateWhatsAppDraft, updateWhatsAppVars } = useCommsStore((state) => ({
    wizard: state.wizard,
    updateWhatsAppDraft: state.updateWhatsAppDraft,
    updateWhatsAppVars: state.updateWhatsAppVars
  }));

  if (wizard.channel !== "WHATSAPP") {
    return null;
  }

  const [error, setError] = useState<string | null>(null);
  const draft = wizard.whatsappDraft;
  const waSenders = SENDERS.filter((sender) => sender.channel === "WHATSAPP");

  const template = useMemo(
    () => WA_TEMPLATES.find((item) => item.id === draft.templateId),
    [draft.templateId]
  );

  const templateVariables = useMemo(() => {
    if (!template) return [];
    const matches = template.body.match(/\{\{(\d+)\}\}/g) ?? [];
    const ids = Array.from(new Set(matches.map((match) => match.replace(/[{}]/g, ""))));
    return ids.slice(0, 2);
  }, [template]);

  const handleNext = () => {
    if (!draft.internalName.trim()) {
      setError("Please enter an internal name.");
      return;
    }
    if (!draft.fromSenderId) {
      setError("Select a sender profile.");
      return;
    }
    if (draft.mode === "TEMPLATE") {
      if (!draft.templateId) {
        setError("Choose a template to continue.");
        return;
      }
    } else if (!draft.messageText.trim()) {
      setError("Provide a freeform message body.");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Compose — WhatsApp</h2>
        <p className="text-xs text-gray-500">
          Use approved templates or switch to freeform. Quick replies and keyword triggers feed the mini-chatbot preview.
        </p>
      </header>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => updateWhatsAppDraft({ mode: "TEMPLATE" })}
          className={[
            "px-4 py-2 rounded-lg border text-sm font-medium transition",
            draft.mode === "TEMPLATE"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200"
          ].join(" ")}
        >
          Template
        </button>
        <button
          type="button"
          onClick={() => updateWhatsAppDraft({ mode: "FREEFORM" })}
          className={[
            "px-4 py-2 rounded-lg border text-sm font-medium transition",
            draft.mode === "FREEFORM"
              ? "bg-gray-900 text-white border-gray-900"
              : "bg-white text-gray-600 border-gray-200"
          ].join(" ")}
        >
          Freeform
        </button>
      </div>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <label className="text-xs font-medium text-gray-700">
            Internal name
            <input
              value={draft.internalName}
              onChange={(event) => updateWhatsAppDraft({ internalName: event.target.value })}
              placeholder="e.g. LIWA flash sale"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={draft.serviceCommunication}
              onChange={(event) => updateWhatsAppDraft({ serviceCommunication: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
            />
            Mark as service communication
          </label>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-medium text-gray-700">
            Sender
            <select
              value={draft.fromSenderId}
              onChange={(event) => updateWhatsAppDraft({ fromSenderId: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {waSenders.map((sender) => (
                <option key={sender.id} value={sender.id}>
                  {sender.wa?.display}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-gray-700">
            Segment
            <select
              value={draft.segmentId}
              onChange={(event) => updateWhatsAppDraft({ segmentId: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {SEGMENTS.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {draft.mode === "TEMPLATE" ? (
          <div className="space-y-4">
            <TemplatePicker
              value={draft.templateId}
              onChange={(templateId) => {
                updateWhatsAppDraft({ templateId });
                setError(null);
              }}
            />
            {template ? (
              <div className="grid gap-3 border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                <div className="text-xs font-medium text-gray-700">Variable mapping</div>
                {templateVariables.length ? (
                  <div className="grid gap-2">
                    {templateVariables.map((variable) => (
                      <label key={variable} className="text-xs text-gray-600">
                        Variable {variable}
                        <input
                          value={draft.templateVars[variable] ?? ""}
                          onChange={(event) =>
                            updateWhatsAppVars({ [variable]: event.target.value })
                          }
                          placeholder={
                            template.variableHints?.[Number(variable) - 1] ?? `Value ${variable}`
                          }
                          className="mt-1 w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/30"
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Template contains no variables.</p>
                )}
                {template.buttons?.length ? (
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-1">Quick replies</div>
                    <div className="flex flex-wrap gap-2">
                      {template.buttons.map((button) => (
                        <span
                          key={button.text}
                          className="inline-flex items-center rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600"
                        >
                          {button.text}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-3">
            <label className="text-xs font-medium text-gray-700" htmlFor="wa-message">
              Freeform message
            </label>
            <textarea
              id="wa-message"
              value={draft.messageText}
              onChange={(event) => updateWhatsAppDraft({ messageText: event.target.value })}
              rows={5}
              placeholder="Share your update..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
            <PlaceholderMenu
              onInsert={(key) =>
                updateWhatsAppDraft({
                  messageText: `${draft.messageText}${draft.messageText ? " " : ""}{{${key}}}`
                })
              }
            />
          </div>
        )}

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <MediaPicker
              label="Attach media"
              accept="image/*,video/mp4"
              onPick={(file) => {
                const result = validateMms(file);
                if (!result.ok) {
                  setError(result.okType ? "File exceeds 5MB limit." : "Unsupported media type.");
                  return;
                }
                const asset = {
                  id: newId(),
                  url: URL.createObjectURL(file),
                  mime: file.type,
                  sizeBytes: file.size,
                  name: file.name
                };
                updateWhatsAppDraft({ media: [...(draft.media ?? []), asset] });
                setError(null);
              }}
            />
            {draft.media?.length ? <span>{draft.media.length} attachment(s)</span> : <span>No media attached</span>}
          </div>
          {draft.media?.length ? (
            <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
              {draft.media.map((media) => (
                <li key={media.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-xs font-medium text-gray-800">{media.name ?? media.mime}</div>
                    <div className="text-[11px] text-gray-500">{(media.sizeBytes / 1024).toFixed(0)} KB</div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updateWhatsAppDraft({
                        media: draft.media?.filter((item) => item.id !== media.id)
                      })
                    }
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ChatbotBuilder
          blocks={draft.blocks}
          triggers={draft.triggers}
          onBlocksChange={(blocks) => updateWhatsAppDraft({ blocks })}
          onTriggersChange={(triggers) => updateWhatsAppDraft({ triggers })}
        />

        {error ? <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">{error}</div> : null}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Preview
          </button>
        </div>
      </div>
    </Card>
  );
}
