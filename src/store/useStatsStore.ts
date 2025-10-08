import { create } from "zustand";
import { CommStats } from "../types";

type StatsStore = {
  byComm: Record<string, CommStats>;
  bump: (communicationId: string, patch: Partial<CommStats>) => void;
  seed: (communicationId: string) => void;
};

export const useStatsStore = create<StatsStore>((set) => ({
  byComm: {},

  bump: (communicationId, patch) =>
    set((state) => {
      const prev = state.byComm[communicationId] ?? {
        communicationId,
        delivered: 0,
        failed: 0,
        optOuts: 0,
        optIns: 0,
        replies: 0
      };
      return {
        byComm: {
          ...state.byComm,
          [communicationId]: {
            ...prev,
            ...patch
          }
        }
      };
    }),

  seed: (communicationId) =>
    set((state) => ({
      byComm: {
        ...state.byComm,
        [communicationId]: {
          communicationId,
          delivered: Math.floor(Math.random() * 2_000),
          failed: Math.floor(Math.random() * 200),
          optOuts: Math.floor(Math.random() * 100),
          optIns: Math.floor(Math.random() * 100),
          replies: Math.floor(Math.random() * 300)
        }
      }
    }))
}));
