import { useState } from "react";
import Card from "../../components/common/Card";
import PlaceholderMenu from "../../components/common/PlaceholderMenu";
import MediaPicker from "../../components/common/MediaPicker";
import { SEGMENTS, SENDERS } from "../../demoData";
import { estimateSmsParts } from "../../utils/gsm";
import { validateMms } from "../../services/mms";
import { useCommsStore } from "../../store/useCommsStore";
import { newId } from "../../utils/id";

interface Props {
  onNext: () => void;
}

export default function Step1ComposeSMS({ onNext }: Props) {
  const { wizard, updateSmsDraft } = useCommsStore((state) => ({
    wizard: state.wizard,
    updateSmsDraft: state.updateSmsDraft
  }));

  if (wizard.channel !== "SMS") {
    return null;
  }

  const [error, setError] = useState<string | null>(null);
  const draft = wizard.smsDraft;
  const parts = estimateSmsParts(draft.messageText, !!draft.media?.length);

  const smsSenders = SENDERS.filter((sender) => sender.channel === "SMS");

  const handleNext = () => {
    if (!draft.internalName.trim()) {
      setError("Please enter an internal name.");
      return;
    }
    if (!draft.messageText.trim()) {
      setError("Message body is required.");
      return;
    }
    if (!draft.fromSenderId) {
      setError("Select a sender profile.");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">Compose — SMS</h2>
        <p className="text-xs text-gray-500">
          MMS support is preview-only. Character counts update live; STOP compliance is required.
        </p>
      </header>

      <div className="grid gap-5">
        <div className="grid gap-2">
          <label className="text-xs font-medium text-gray-700">
            Internal name
            <input
              value={draft.internalName}
              onChange={(event) => updateSmsDraft({ internalName: event.target.value })}
              placeholder="e.g. Premium July push"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-xs text-gray-700">
            <input
              type="checkbox"
              checked={draft.serviceCommunication}
              onChange={(event) => updateSmsDraft({ serviceCommunication: event.target.checked })}
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
              onChange={(event) => updateSmsDraft({ fromSenderId: event.target.value })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {smsSenders.map((sender) => (
                <option key={sender.id} value={sender.id}>
                  {sender.sms?.display}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-gray-700">
            Segment
            <select
              value={draft.segmentId}
              onChange={(event) => updateSmsDraft({ segmentId: event.target.value })}
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

        <div className="grid gap-2">
          <label className="text-xs font-medium text-gray-700" htmlFor="sms-message">
            Message
          </label>
          <textarea
            id="sms-message"
            value={draft.messageText}
            onChange={(event) => updateSmsDraft({ messageText: event.target.value })}
            rows={5}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            <span>
              Length: {parts.length} chars · Segments: {parts.parts} ({parts.unicode ? "Unicode" : "GSM-7"})
            </span>
            <span>Segment size: {parts.perSegment}</span>
            {draft.media?.length ? <span>MMS preview enabled</span> : null}
          </div>
        </div>

        <PlaceholderMenu
          onInsert={(key) =>
            updateSmsDraft({ messageText: `${draft.messageText}${draft.messageText ? " " : ""}{{${key}}}` })
          }
        />

        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-3">
            <MediaPicker
              label="Attach media"
              accept="image/*,video/mp4,audio/mpeg,application/pdf"
              onPick={(file) => {
                const result = validateMms(file);
                if (!result.ok) {
                  setError(
                    !result.okType
                      ? "Unsupported media type."
                      : "File exceeds 5MB limit."
                  );
                  return;
                }
                const asset = {
                  id: newId(),
                  url: URL.createObjectURL(file),
                  mime: file.type,
                  sizeBytes: file.size,
                  name: file.name
                };
                updateSmsDraft({ media: [...(draft.media ?? []), asset] });
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
                      updateSmsDraft({
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
          <div className="text-xs text-gray-700">
            Compliance line (required):{" "}
            <input
              type="text"
              value={draft.complianceLine}
              onChange={(event) => updateSmsDraft({ complianceLine: event.target.value })}
              className="ml-2 inline-flex w-56 rounded border border-gray-300 px-2 py-1 text-xs focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900/30"
            />
          </div>
        </div>

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
