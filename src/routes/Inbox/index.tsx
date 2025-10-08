import { useEffect, useMemo, useState } from "react";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import { useInboxStore } from "../../store/useInboxStore";
import { useCommsStore } from "../../store/useCommsStore";
import { on, simulateInbound, simulateTriggerResponder } from "../../services/simulator";
import { formatTimestamp } from "../../utils/time";

export default function InboxRoute() {
  const {
    threads,
    activeThreadId,
    setActiveThread,
    appendInbound,
    appendOutbound,
    appendMessage,
    resetUnread
  } = useInboxStore((state) => ({
    threads: state.threads,
    activeThreadId: state.activeThreadId,
    setActiveThread: state.setActiveThread,
    appendInbound: state.appendInbound,
    appendOutbound: state.appendOutbound,
    appendMessage: state.appendMessage,
    resetUnread: state.resetUnread
  }));

  const [outboundDraft, setOutboundDraft] = useState("");
  const whatsappDraft = useCommsStore((state) => state.wizard.whatsappDraft);

  useEffect(() => {
    const offInbound = on("inbound", (message) => {
      const thread = useInboxStore.getState().threads.find((item) => item.channel === message.channel);
      if (!thread) return;
      appendInbound(message);
      if (message.channel === "WHATSAPP") {
        simulateTriggerResponder(message.text ?? "", whatsappDraft.triggers ?? [], whatsappDraft.blocks ?? []);
      }
    });

    const offOutbound = on("outbound", (message) => {
      const thread = useInboxStore.getState().threads.find((item) => item.channel === message.channel);
      if (!thread) return;
      appendMessage(thread.id, message);
      if (useInboxStore.getState().activeThreadId === thread.id) {
        resetUnread(thread.id);
      }
    });

    return () => {
      offInbound();
      offOutbound();
    };
  }, [appendInbound, appendMessage, resetUnread, whatsappDraft.blocks, whatsappDraft.triggers]);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId]
  );

  useEffect(() => {
    if (activeThread && activeThread.unread) {
      resetUnread(activeThread.id);
    }
  }, [activeThread, resetUnread]);

  return (
    <div className="grid md:grid-cols-[280px,1fr] gap-4">
      <Card>
        <header className="mb-3">
          <h2 className="text-base font-semibold text-gray-900">Conversations</h2>
          <p className="text-xs text-gray-500">Simulated, in-memory threads. Click to inspect messages.</p>
        </header>
        <ul className="space-y-2">
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                type="button"
                onClick={() => setActiveThread(thread.id)}
                className={[
                  "w-full rounded-lg border px-3 py-2 text-left transition",
                  activeThread?.id === thread.id
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white hover:border-gray-400"
                ].join(" ")}
              >
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{thread.title}</span>
                  {thread.unread ? <Badge tone="warning">New</Badge> : null}
                </div>
                <div className={["text-xs", activeThread?.id === thread.id ? "text-gray-200" : "text-gray-500"].join(" ")}>
                  {thread.channel}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Thread</h2>
            <p className="text-xs text-gray-500">
              Use the simulator buttons to inject inbound messages. WhatsApp keywords trigger configured follow-ups.
            </p>
          </div>
          {activeThread ? <Badge tone="neutral">{activeThread.channel}</Badge> : null}
        </header>

        {activeThread ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 h-64 overflow-y-auto flex flex-col gap-3">
              {activeThread.messages.length ? (
                activeThread.messages.map((message) => (
                  <div
                    key={message.id}
                    className={[
                      "max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed",
                      message.direction === "OUTBOUND"
                        ? "self-end bg-gray-900 text-white"
                        : "self-start bg-white text-gray-800 border border-gray-200"
                    ].join(" ")}
                  >
                    <p>{message.text}</p>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-gray-400">
                      {message.direction === "OUTBOUND" ? "Outbound" : "Inbound"} · {formatTimestamp(message.timestamp)}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center mt-6">No messages yet. Simulate or send one.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => simulateInbound("SMS", "STOP")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              >
                Simulate SMS STOP
              </button>
              <button
                type="button"
                onClick={() => simulateInbound("WHATSAPP", "MORE")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              >
                Simulate WA MORE
              </button>
              <button
                type="button"
                onClick={() => simulateInbound("WHATSAPP", "POINTS")}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
              >
                Simulate WA POINTS
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (!outboundDraft.trim()) return;
                appendOutbound(activeThread.id, outboundDraft.trim());
                setOutboundDraft("");
              }}
              className="flex gap-2"
            >
              <input
                value={outboundDraft}
                onChange={(event) => setOutboundDraft(event.target.value)}
                placeholder="Type a response..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a conversation.</p>
        )}
      </Card>
    </div>
  );
}
