import clsx from "clsx";
import { useMemo } from "react";
import { CommType } from "../../types";
import { useCommsStore } from "../../store/useCommsStore";

interface Step0Props {
  onNext: () => void;
}

const COMM_TYPES: Array<{ id: CommType; label: string; description: string }> = [
  { id: "CAMPAIGN", label: "Campaign", description: "One-off push with scheduling" },
  { id: "AUTOMATED", label: "Automated", description: "Recurring or triggered sends" },
  { id: "SIGNUP_RESPONSE", label: "Signup response", description: "Welcome journeys" },
  { id: "REDEMPTION_RESPONSE", label: "Redemption response", description: "Offer confirmations" },
  { id: "TRIGGERED_POINTS", label: "Triggered points", description: "Balance updates" },
  { id: "AUTHENTICATION_OTP", label: "Authentication / OTP", description: "One-time passcodes" }
];

export default function Step0TypeChannel({ onNext }: Step0Props) {
  const { wizard, setCommType, setChannel, updateOtpDraft } = useCommsStore((state) => ({
    wizard: state.wizard,
    setCommType: state.setCommType,
    setChannel: state.setChannel,
    updateOtpDraft: state.updateOtpDraft
  }));

  const channelOptions = useMemo(() => {
    if (wizard.commType === "AUTHENTICATION_OTP") {
      return [
        { id: "SMS", label: "SMS" },
        { id: "WHATSAPP", label: "WhatsApp" },
        { id: "AUTO", label: "Auto (WA → SMS fallback)" }
      ];
    }
    return [
      { id: "SMS", label: "SMS" },
      { id: "WHATSAPP", label: "WhatsApp" }
    ];
  }, [wizard.commType]);

  const canContinue = wizard.commType && wizard.channel;

  return (
    <div className="space-y-6">
      <section>
        <header className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">1. Choose communication type</h2>
          <p className="text-sm text-gray-500">This drives fields, scheduling rules, and preview behaviour.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {COMM_TYPES.map((item) => {
            const isActive = wizard.commType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCommType(item.id);
                  if (item.id !== "AUTHENTICATION_OTP" && wizard.channel === "AUTO") {
                    setChannel("SMS");
                  }
                  if (item.id === "AUTHENTICATION_OTP") {
                    updateOtpDraft({ channel: wizard.channel === "AUTO" ? "AUTO" : wizard.channel ?? "AUTO" });
                  }
                }}
                className={clsx(
                  "rounded-xl border text-left p-4 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white hover:border-gray-400"
                )}
              >
                <div className="text-sm font-semibold">{item.label}</div>
                <div className={clsx("text-xs mt-2", isActive ? "text-gray-200" : "text-gray-500")}>
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <header className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">2. Select channel</h2>
          <p className="text-sm text-gray-500">
            SMS and WhatsApp are configured separately to maintain compliance and creative rules.
          </p>
        </header>
        <div className="flex flex-wrap gap-3">
          {channelOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setChannel(option.id as any);
                if (wizard.commType === "AUTHENTICATION_OTP") {
                  updateOtpDraft({ channel: option.id as any });
                }
              }}
              className={clsx(
                "px-4 py-2 rounded-lg border text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                wizard.channel === option.id
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-400"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <div className="pt-2">
        <button
          type="button"
          onClick={onNext}
          disabled={!canContinue}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue to Compose
        </button>
      </div>
    </div>
  );
}
