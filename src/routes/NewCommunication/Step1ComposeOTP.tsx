import { useState } from "react";
import Card from "../../components/common/Card";
import { WA_TEMPLATES } from "../../demoData";
import { useCommsStore } from "../../store/useCommsStore";

interface Props {
  onNext: () => void;
}

const OTP_LENGTHS: Array<4 | 5 | 6> = [4, 5, 6];

export default function Step1ComposeOTP({ onNext }: Props) {
  const { wizard, updateOtpDraft, setChannel } = useCommsStore((state) => ({
    wizard: state.wizard,
    updateOtpDraft: state.updateOtpDraft,
    setChannel: state.setChannel
  }));

  if (wizard.commType !== "AUTHENTICATION_OTP") {
    return null;
  }

  const [error, setError] = useState<string | null>(null);
  const draft = wizard.otpDraft;

  const handleNext = () => {
    if (!draft.recipientE164.trim()) {
      setError("Enter a recipient number in E.164 format.");
      return;
    }
    if (draft.expiryMinutes < 1) {
      setError("Expiry must be at least 1 minute.");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">OTP configuration</h2>
        <p className="text-xs text-gray-500">
          OTPs are preview-only in this prototype. Choose channel, code length, and expiry to update the preview.
        </p>
      </header>

      <div className="grid gap-4">
        <div className="text-xs font-medium text-gray-700">Channel preference</div>
        <div className="flex flex-wrap gap-3 text-sm">
          {["SMS", "WHATSAPP", "AUTO"].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setChannel(option as any);
                updateOtpDraft({ channel: option as any });
              }}
              className={[
                "px-4 py-2 rounded-lg border transition",
                draft.channel === option ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"
              ].join(" ")}
            >
              {option === "AUTO" ? "Auto (WA → SMS fallback)" : option}
            </button>
          ))}
        </div>

        <label className="text-xs font-medium text-gray-700">
          Recipient (E.164)
          <input
            value={draft.recipientE164}
            onChange={(event) => updateOtpDraft({ recipientE164: event.target.value })}
            placeholder="+447700900123"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          />
        </label>

        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs font-medium text-gray-700">
            Code length
            <select
              value={draft.codeLength}
              onChange={(event) => updateOtpDraft({ codeLength: Number(event.target.value) as 4 | 5 | 6 })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            >
              {OTP_LENGTHS.map((length) => (
                <option key={length} value={length}>
                  {length} digits
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-medium text-gray-700">
            Expiry (minutes)
            <input
              type="number"
              min={1}
              value={draft.expiryMinutes}
              onChange={(event) => updateOtpDraft({ expiryMinutes: Number(event.target.value) })}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
            />
          </label>
        </div>

        <label className="text-xs font-medium text-gray-700">
          WhatsApp template (optional)
          <select
            value={draft.waTemplateId ?? ""}
            onChange={(event) => updateOtpDraft({ waTemplateId: event.target.value || undefined })}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
          >
            <option value="">Use default copy</option>
            {WA_TEMPLATES.filter((tpl) => tpl.category === "AUTHENTICATION").map((template) => (
              <option key={template.id} value={template.id}>
                {template.name} · {template.language}
              </option>
            ))}
          </select>
        </label>

        {error ? (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
            {error}
          </div>
        ) : null}

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
