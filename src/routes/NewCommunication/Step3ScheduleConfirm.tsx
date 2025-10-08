import { useMemo, useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { useCommsStore, buildComposePayload, resolveSchedule } from "../../store/useCommsStore";
import { useStatsStore } from "../../store/useStatsStore";
import { isOtp } from "../../services/rules";
import { cadenceLabels } from "../../utils/validators";
import { formatTimestamp } from "../../utils/time";

interface Step3Props {
  onBack: () => void;
}

const TIMEZONES = ["UTC", "Europe/London", "Europe/Dubai", "America/New_York"];

export default function Step3ScheduleConfirm({ onBack }: Step3Props) {
  const { wizard, updateSchedule, add, resetWizard } = useCommsStore((state) => ({
    wizard: state.wizard,
    updateSchedule: state.updateSchedule,
    add: state.add,
    resetWizard: state.resetWizard
  }));
  const seedStats = useStatsStore((state) => state.seed);

  const { commType, channel, smsDraft, whatsappDraft, otpDraft, scheduleDraft } = wizard;
  const [confirmationId, setConfirmationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scheduleKind = scheduleDraft.kind;

  const summary = useMemo(() => {
    if (!commType || !channel) return null;
    const compose = buildComposePayload(commType, channel, smsDraft, whatsappDraft, otpDraft);
    return {
      type: commType,
      channel: channel === "WHATSAPP" ? "WHATSAPP" : "SMS",
      name:
        "internalName" in compose ? compose.internalName : `OTP to ${compose.recipientE164 || "recipient"}`,
      segment:
        "segmentId" in compose
          ? compose.segmentId
          : "OTP" // OTP has no segment
    };
  }, [commType, channel, smsDraft, whatsappDraft, otpDraft]);

  const handleConfirm = () => {
    if (!commType || !channel) {
      setError("Type or channel missing; please go back and review.");
      return;
    }
    if (isOtp(commType)) {
      if (!otpDraft.recipientE164) {
        setError("Recipient number is required for OTP.");
        return;
      }
    }
    if (!isOtp(commType) && channel === "SMS" && !smsDraft.messageText.trim()) {
      setError("SMS content missing.");
      return;
    }
    if (!isOtp(commType) && channel === "WHATSAPP") {
      if (whatsappDraft.mode === "TEMPLATE" && !whatsappDraft.templateId) {
        setError("WhatsApp template missing.");
        return;
      }
      if (whatsappDraft.mode === "FREEFORM" && !whatsappDraft.messageText.trim()) {
        setError("WhatsApp message missing.");
        return;
      }
    }

    const compose = buildComposePayload(commType, channel, smsDraft, whatsappDraft, otpDraft);
    const schedule = resolveSchedule(commType, scheduleDraft);
    const communicationChannel =
      commType === "AUTHENTICATION_OTP"
        ? channel === "WHATSAPP"
          ? "WHATSAPP"
          : "SMS"
        : (channel === "WHATSAPP" ? "WHATSAPP" : "SMS");

    const newId = add({
      type: commType,
      channel: communicationChannel,
      compose,
      schedule,
      complianceLine: smsDraft.complianceLine
    });
    seedStats(newId);
    setConfirmationId(newId);
    setError(null);
    resetWizard();
  };

  const campaignDatetimeLocal = useMemo(() => {
    const iso = scheduleDraft.campaign.datetimeISO;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (value: number) => `${value}`.padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`;
  }, [scheduleDraft.campaign.datetimeISO]);

  if (!commType || !channel) {
    return (
      <Card>
        <p className="text-sm text-gray-600">
          Complete the previous steps to configure schedule and confirmation.
        </p>
      </Card>
    );
  }

  const summaryPairs = [
    { label: "Type", value: commType.replaceAll("_", " ") },
    { label: "Channel", value: summary?.channel ?? channel },
    { label: "Internal name", value: summary?.name ?? "—" },
    {
      label: "Segment / recipient",
      value: isOtp(commType) ? otpDraft.recipientE164 || "—" : summary?.segment ?? "—"
    },
    isOtp(commType)
      ? { label: "Service communication", value: "—" }
      : {
          label: "Service communication",
          value:
            (channel === "SMS" ? smsDraft.serviceCommunication : whatsappDraft.serviceCommunication)
              ? "Yes"
              : "No"
        }
  ];

  return (
    <Card>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Schedule & confirm</h2>
          <p className="text-xs text-gray-500">
            Scheduler adapts based on communication type. OTPs are preview-only and skip scheduling.
          </p>
        </div>
        <Badge tone="neutral">{commType.replaceAll("_", " ")}</Badge>
      </header>

      <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Scheduling</h3>
          {isOtp(commType) ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
              OTP sends are immediate and preview-only in this prototype. No scheduler required.
            </div>
          ) : scheduleKind === "CAMPAIGN" ? (
            <div className="grid gap-3">
              <label className="text-xs font-medium text-gray-700">
                Launch datetime
                <input
                  type="datetime-local"
                  value={campaignDatetimeLocal}
                  onChange={(event) => {
                    const value = event.target.value;
                    updateSchedule({
                      campaign: {
                        ...scheduleDraft.campaign,
                        datetimeISO: value ? new Date(value).toISOString() : scheduleDraft.campaign.datetimeISO
                      }
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </label>
              <label className="text-xs font-medium text-gray-700">
                Timezone
                <select
                  value={scheduleDraft.campaign.timezone}
                  onChange={(event) =>
                    updateSchedule({
                      campaign: {
                        ...scheduleDraft.campaign,
                        timezone: event.target.value
                      }
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                >
                  {TIMEZONES.map((zone) => (
                    <option key={zone} value={zone}>
                      {zone}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-medium text-gray-700">
                Rate limit (per minute)
                <input
                  type="number"
                  min={50}
                  value={scheduleDraft.campaign.rateLimitPerMin ?? 1000}
                  onChange={(event) =>
                    updateSchedule({
                      campaign: {
                        ...scheduleDraft.campaign,
                        rateLimitPerMin: Number(event.target.value)
                      }
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                />
              </label>
            </div>
          ) : scheduleKind === "AUTOMATED" ? (
            <div className="space-y-3">
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium text-gray-700">Cadence</legend>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(cadenceLabels).map(([value, label]) => (
                    <label key={value} className="inline-flex items-center gap-2 text-xs text-gray-700">
                      <input
                        type="checkbox"
                        checked={scheduleDraft.automated.cadence.includes(value as any)}
                        onChange={(event) => {
                          const next = new Set(scheduleDraft.automated.cadence);
                          if (event.target.checked) {
                            next.add(value as any);
                          } else {
                            next.delete(value as any);
                          }
                          updateSchedule({
                            automated: {
                              ...scheduleDraft.automated,
                              cadence: Array.from(next)
                            }
                          });
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="text-xs font-medium text-gray-700">
                  Start (optional)
                  <input
                    type="datetime-local"
                    value={scheduleDraft.automated.startISO ? formatForInput(scheduleDraft.automated.startISO) : ""}
                    onChange={(event) =>
                      updateSchedule({
                        automated: {
                          ...scheduleDraft.automated,
                          startISO: event.target.value ? new Date(event.target.value).toISOString() : undefined
                        }
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </label>
                <label className="text-xs font-medium text-gray-700">
                  End (optional)
                  <input
                    type="datetime-local"
                    value={scheduleDraft.automated.endISO ? formatForInput(scheduleDraft.automated.endISO) : ""}
                    onChange={(event) =>
                      updateSchedule({
                        automated: {
                          ...scheduleDraft.automated,
                          endISO: event.target.value ? new Date(event.target.value).toISOString() : undefined
                        }
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </label>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={scheduleDraft.automated.active}
                  onChange={(event) =>
                    updateSchedule({
                      automated: {
                        ...scheduleDraft.automated,
                        active: event.target.checked
                      }
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                Active
              </label>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-2 text-sm text-gray-600">
              <p>Triggered/response journeys run continuously while active.</p>
              <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={scheduleDraft.activation.active}
                  onChange={(event) =>
                    updateSchedule({
                      activation: {
                        ...scheduleDraft.activation,
                        active: event.target.checked
                      }
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                Keep journey active
              </label>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
          <dl className="space-y-2 text-sm">
            {summaryPairs.map((item) => (
              <div key={item.label} className="flex justify-between gap-6 border-b border-dashed border-gray-200 pb-2">
                <dt className="text-gray-500">{item.label}</dt>
                <dd className="text-gray-900 text-right">{item.value}</dd>
              </div>
            ))}
            {!isOtp(commType) && channel === "WHATSAPP" && whatsappDraft.mode === "TEMPLATE" && whatsappDraft.templateId ? (
              <div className="flex justify-between gap-6 border-b border-dashed border-gray-200 pb-2">
                <dt className="text-gray-500">Template</dt>
                <dd className="text-gray-900 text-right">{whatsappDraft.templateId}</dd>
              </div>
            ) : null}
            {!isOtp(commType) && channel === "SMS" ? (
              <div className="flex justify-between gap-6 border-b border-dashed border-gray-200 pb-2">
                <dt className="text-gray-500">Compliance line</dt>
                <dd className="text-gray-900 text-right">{smsDraft.complianceLine}</dd>
              </div>
            ) : null}
            {!isOtp(commType) && scheduleKind === "CAMPAIGN" ? (
              <div className="flex justify-between gap-6 border-b border-dashed border-gray-200 pb-2">
                <dt className="text-gray-500">Launch</dt>
                <dd className="text-gray-900 text-right">
                  {formatTimestamp(scheduleDraft.campaign.datetimeISO)} · {scheduleDraft.campaign.timezone}
                </dd>
              </div>
            ) : null}
            {!isOtp(commType) && scheduleKind === "AUTOMATED" ? (
              <div className="flex justify-between gap-6 border-b border-dashed border-gray-200 pb-2">
                <dt className="text-gray-500">Cadence</dt>
                <dd className="text-gray-900 text-right max-w-[220px]">
                  {scheduleDraft.automated.cadence.length
                    ? scheduleDraft.automated.cadence.map((item) => cadenceLabels[item]).join(", ")
                    : "Select cadence"}
                </dd>
              </div>
            ) : null}
          </dl>

          {error ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {error}
            </div>
          ) : null}

          {confirmationId ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              Communication saved with ID <strong>{confirmationId}</strong>. View it in “All Communications”.
            </div>
          ) : null}
        </section>
      </div>

      <footer className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Confirm & Save
        </button>
      </footer>
    </Card>
  );
}

function formatForInput(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (value: number) => `${value}`.padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
