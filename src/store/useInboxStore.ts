import { create } from "zustand";
import { ConversationMessage } from "../types";
import { newId } from "../utils/id";
import { nowISO } from "../utils/time";

export type Thread = {
  id: string;
  title: string;
  channel: "SMS" | "WHATSAPP";
  messages: ConversationMessage[];
  unread: boolean;
};

type InboxStore = {
  threads: Thread[];
  activeThreadId?: string;
  setActiveThread: (threadId: string) => void;
  appendInbound: (message: ConversationMessage) => void;
  appendOutbound: (threadId: string, text: string) => ConversationMessage | undefined;
  appendMessage: (threadId: string, message: ConversationMessage) => void;
  resetUnread: (threadId: string) => void;
};

const initialThreads: Thread[] = [
  { id: "t1", title: "Ana Silva", channel: "WHATSAPP", messages: [], unread: false },
  { id: "t2", title: "John Doe", channel: "SMS", messages: [], unread: false }
];

export const useInboxStore = create<InboxStore>((set, get) => ({
  threads: initialThreads,
  activeThreadId: "t1",

  setActiveThread: (threadId) => {
    set((state) => ({
      activeThreadId: threadId,
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, unread: false } : thread
      )
    }));
  },

  appendInbound: (message) =>
    set((state) => {
      const target = state.threads.find((thread) => thread.channel === message.channel);
      if (!target) return state;
      const updated = state.threads.map((thread) =>
        thread.id === target.id
          ? {
              ...thread,
              messages: [...thread.messages, message],
              unread: state.activeThreadId === thread.id ? false : true
            }
          : thread
      );
      return { threads: updated };
    }),

  appendOutbound: (threadId, text) => {
    const message: ConversationMessage = {
      id: newId(),
      channel: get().threads.find((thread) => thread.id === threadId)?.channel ?? "SMS",
      direction: "OUTBOUND",
      text,
      timestamp: nowISO()
    };
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, message], unread: false }
          : thread
      )
    }));
    return message;
  },

  appendMessage: (threadId, message) =>
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, message] }
          : thread
      )
    })),

  resetUnread: (threadId) =>
    set((state) => ({
      threads: state.threads.map((thread) =>
        thread.id === threadId ? { ...thread, unread: false } : thread
      )
    }))
}));
