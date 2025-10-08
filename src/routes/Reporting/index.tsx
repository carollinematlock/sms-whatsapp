import Card from "../../components/common/Card";
import CounterStat from "../../components/common/CounterStat";
import { useStatsStore } from "../../store/useStatsStore";
import { useCommsStore } from "../../store/useCommsStore";

export default function ReportingRoute() {
  const stats = useStatsStore((state) => state.byComm);
  const seed = useStatsStore((state) => state.seed);
  const communications = useCommsStore((state) => state.items);

  const totals = Object.values(stats).reduce(
    (acc, item) => {
      acc.delivered += item.delivered;
      acc.failed += item.failed;
      acc.optOuts += item.optOuts;
      acc.optIns += item.optIns;
      acc.replies += item.replies;
      return acc;
    },
    { delivered: 0, failed: 0, optOuts: 0, optIns: 0, replies: 0 }
  );

  const handleGenerate = () => {
    if (!communications.length) return;
    communications.forEach((communication) => seed(communication.id));
  };

  return (
    <Card>
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Reporting</h2>
          <p className="text-xs text-gray-500">
            Aggregate counters across all communications. No backend — randomised when seeding.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          disabled={!communications.length}
        >
          Generate test stats
        </button>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <CounterStat label="Delivered" value={totals.delivered} />
        <CounterStat label="Failed" value={totals.failed} />
        <CounterStat label="Opt-outs" value={totals.optOuts} />
        <CounterStat label="Opt-ins" value={totals.optIns} />
        <CounterStat label="Replies" value={totals.replies} />
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Counters refresh instantly when you confirm communications or seed demo numbers.
      </p>
    </Card>
  );
}
