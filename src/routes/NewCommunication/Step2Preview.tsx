import { useEffect, useMemo, useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { useCommsStore } from "../../store/useCommsStore";
import { buildOtpPreview, buildSmsPreview, buildWaPreview } from "../../services/preview";
import { findBlock } from "../../utils/waTriggers";
import { newId } from "../../utils/id";
import { PLACEHOLDER_SAMPLE_MAP, WA_TEMPLATES } from "../../demoData";
import { renderWithSamples } from "../../utils/placeholder";

interface Step2PreviewProps {
  onNext: () => void;
  onBack: () => void;
}

type PreviewMessage = {
  id: string;
  direction: "OUTBOUND" | "INBOUND";
  text: string;
  meta?: Record<string, string | number>;
};

export default function Step2Preview({ onNext, onBack }: Step2PreviewProps) {
  const { wizard } = useCommsStore((state) => ({ wizard: state.wizard }));
  const { commType, channel, smsDraft, whatsappDraft, otpDraft } = wizard;
  const [keyword, setKeyword] = useState("");

  const smsPreview = useMemo(() => {
    if (commType === "AUTHENTICATION_OTP") return null;
    return buildSmsPreview({
      channel: "SMS",
      serviceCommunication: smsDraft.serviceCommunication,
      internalName: smsDraft.internalName || "Untitled SMS",
      segmentId: smsDraft.segmentId,
      fromSenderId: smsDraft.fromSenderId,
      messageText: smsDraft.messageText,
      media: smsDraft.media,
      complianceLine: smsDraft.complianceLine
    });
  }, [commType, smsDraft]);

  const waPreview = useMemo(() => {
    if (commType === "AUTHENTICATION_OTP") return null;
    return buildWaPreview({
      channel: "WHATSAPP",
      serviceCommunication: whatsappDraft.serviceCommunication,
      internalName: whatsappDraft.internalName || "Untitled WhatsApp",
      segmentId: whatsappDraft.segmentId,
      fromSenderId: whatsappDraft.fromSenderId,
      mode: whatsappDraft.mode,
      templateId: whatsappDraft.templateId,
      templateVars: whatsappDraft.templateVars,
      messageText: whatsappDraft.messageText,
      media: whatsappDraft.media,
      blocks: whatsappDraft.blocks,
      triggers: whatsappDraft.triggers
    });
  }, [commType, whatsappDraft]);

  const [waConversation, setWaConversation] = useState<PreviewMessage[]>([]);

  useEffect(() => {
    if (!waPreview) {
      setWaConversation([]);
      return;
    }
    const initial: PreviewMessage = {
      id: newId(),
      direction: "OUTBOUND",
      text:
        waPreview.mode === "TEMPLATE"
          ? waPreview.body
          : renderWithSamples(waPreview.messageText ?? "", PLACEHOLDER_SAMPLE_MAP)
    };
    setWaConversation([initial]);
  }, [waPreview?.mode, waPreview?.body, waPreview?.messageText, waPreview?.templateId]);

  const otpPreview = useMemo(() => {
    if (commType !== "AUTHENTICATION_OTP") return null;
    return buildOtpPreview(otpDraft);
  }, [commType, otpDraft]);

  const quickReplies = useMemo(() => {
    if (!waPreview) return [];
    if (waPreview.template?.buttons?.length) {
      return waPreview.template.buttons.map((button) => button.text);
    }
    if (waPreview.blocks?.[0]?.buttons?.length) {
      return waPreview.blocks[0].buttons.map((button) => button.text);
    }
    return [];
  }, [waPreview]);

  const appendConversation = (messages: PreviewMessage[]) => {
    setWaConversation((current) => [...current, ...messages]);
  };

  const resolveFollowUps = (text: string, type: "KEYWORD" | "BUTTON_CLICK") => {
    if (!waPreview?.triggers?.length || !waPreview.blocks?.length) return [];
    const trigger = waPreview.triggers.find(
      (item) => item.on === type && item.match.toLowerCase().trim() === text.toLowerCase().trim()
    );
    if (!trigger) return [];
    const block = findBlock(waPreview.blocks, trigger.blockRef);
    if (!block) return [];
    const outbound: PreviewMessage = {
      id: newId(),
      direction: "OUTBOUND",
      text: block.text,
      meta: { block: block.id }
    };
    return [outbound];
  };

  const handleQuickReply = (text: string) => {
    appendConversation([
      { id: newId(), direction: "INBOUND", text, meta: { quickReply: true } },
      ...resolveFollowUps(text, "BUTTON_CLICK")
    ]);
  };

  const handleKeywordSubmit = () => {
    if (!keyword.trim()) return;
    const text = keyword.trim();
    setKeyword("");
    appendConversation([
      { id: newId(), direction: "INBOUND", text },
      ...resolveFollowUps(text, "KEYWORD")
    ]);
  };

  return (
    <div className="space-y-5">
      <Card>
        <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Preview</h2>
            <p className="text-xs text-gray-500">
              Generated using in-memory data only. Interact with quick replies to see conversational follow-ups.
            </p>
          </div>
          {commType ? <Badge tone="neutral">{commType.replaceAll("_", " ")}</Badge> : null}
        </header>

        {commType === "AUTHENTICATION_OTP" && otpPreview ? (
          <OtpPreviewSection preview={otpPreview} />
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {channel === "SMS" && smsPreview ? <SmsPreviewCard preview={smsPreview} /> : null}
            {channel === "WHATSAPP" && waPreview ? (
              <WhatsAppPreviewCard
                preview={waPreview}
                conversation={waConversation}
                quickReplies={quickReplies}
                keyword={keyword}
                onQuickReply={handleQuickReply}
                onKeywordChange={setKeyword}
                onKeywordSubmit={handleKeywordSubmit}
              />
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Continue
          </button>
        </div>
      </Card>
    </div>
  );
}

function SmsPreviewCard({ preview }: { preview: ReturnType<typeof buildSmsPreview> }) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">SMS preview</h3>
        <Badge tone="neutral">SMS</Badge>
      </header>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{preview.resolved}</p>
        {preview.media?.length ? (
          <div className="text-xs text-gray-500">Media attachments: {preview.media.length}</div>
        ) : null}
      </div>
      <div className="text-xs text-gray-500">
        Length {preview.parts.length} · Segments {preview.parts.parts} · {preview.parts.unicode ? "Unicode" : "GSM-7"}
      </div>
      <div className="text-[11px] text-gray-500 uppercase tracking-wide">
        Compliance: {preview.complianceLine ?? "Text STOP to opt out"}
      </div>
    </section>
  );
}

function WhatsAppPreviewCard({
  preview,
  conversation,
  quickReplies,
  keyword,
  onQuickReply,
  onKeywordChange,
  onKeywordSubmit
}: {
  preview: ReturnType<typeof buildWaPreview>;
  conversation: PreviewMessage[];
  quickReplies: string[];
  keyword: string;
  onQuickReply: (text: string) => void;
  onKeywordChange: (value: string) => void;
  onKeywordSubmit: () => void;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">WhatsApp preview</h3>
        <Badge tone="default">WhatsApp</Badge>
      </header>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-3 max-h-[320px] overflow-y-auto">
        {conversation.map((message) => (
          <div
            key={message.id}
            className={[
              "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
              message.direction === "OUTBOUND"
                ? "self-end bg-emerald-600 text-white ml-auto"
                : "self-start bg-white text-gray-800 border border-emerald-100"
            ].join(" ")}
          >
            <div>{message.text}</div>
            {message.meta?.block ? (
              <div className="mt-1 text-[10px] uppercase tracking-wide text-emerald-200">
                Block: {message.meta.block}
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {quickReplies.length ? (
        <div className="flex flex-wrap gap-2">
          {quickReplies.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => onQuickReply(reply)}
              className="rounded-full border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 hover:border-gray-400"
            >
              {reply}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Type keyword..."
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
        />
        <button
          type="button"
          onClick={onKeywordSubmit}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Send
        </button>
      </div>
    </section>
  );
}

function OtpPreviewSection({
  preview
}: {
  preview: NonNullable<ReturnType<typeof buildOtpPreview>>;
}) {
  const otpTemplate = preview.compose.waTemplateId
    ? WA_TEMPLATES.find((template) => template.id === preview.compose.waTemplateId)
    : undefined;
  const waCopy = otpTemplate
    ? otpTemplate.body.replace(/\{\{1\}\}/g, "0000").replace(/\{\{2\}\}/g, String(preview.compose.expiryMinutes))
    : preview.wa;

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">SMS copy</h3>
          <Badge tone="neutral">SMS</Badge>
        </header>
        <p className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-relaxed">
          {preview.sms}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">WhatsApp copy</h3>
          <Badge tone="default">WhatsApp</Badge>
        </header>
        <p className="rounded-xl border border-gray-200 bg-emerald-50/70 px-3 py-2 text-sm leading-relaxed">
          {waCopy}
        </p>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Channel preference</h3>
        </header>
        <p className="text-sm text-gray-600">
          Selected option: <strong>{preview.compose.channel === "AUTO" ? "Auto (WhatsApp first, fallback to SMS)" : preview.compose.channel}</strong>
        </p>
        <p className="text-xs text-gray-500">
          Preview shows the default copy for each channel. In production this would call downstream OTP services.
        </p>
      </section>
    </div>
  );
}
