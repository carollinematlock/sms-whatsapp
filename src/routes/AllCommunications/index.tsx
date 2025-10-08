import { Link } from "react-router-dom";
import Card from "../../components/common/Card";
import Table from "../../components/common/Table";
import Badge from "../../components/common/Badge";
import { useCommsStore } from "../../store/useCommsStore";
import { useStatsStore } from "../../store/useStatsStore";
import { formatTimestamp } from "../../utils/time";

export default function AllCommunicationsRoute() {
  const communications = useCommsStore((state) => state.items);
  const statsByComm = useStatsStore((state) => state.byComm);

  return (
    <Card>
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">All communications</h2>
          <p className="text-xs text-gray-500">Copy/archive actions are hidden in this prototype; reporting only.</p>
        </div>
        <Badge tone="neutral">{communications.length} saved</Badge>
      </header>
      <Table>
        <thead>
          <tr className="text-xs uppercase tracking-wide text-gray-500 border-b border-gray-200">
            <th className="py-2 font-medium">Internal Name</th>
            <th className="py-2 font-medium">Type</th>
            <th className="py-2 font-medium text-center">Channel</th>
            <th className="py-2 font-medium text-center">Status</th>
            <th className="py-2 font-medium text-center">Created</th>
            <th className="py-2 font-medium text-center">Reporting</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {communications.length ? (
            communications.map((communication) => {
              const stats = statsByComm[communication.id];
              const label =
                "compose" in communication && "internalName" in communication.compose
                  ? communication.compose.internalName
                  : communication.id;
              return (
                <tr key={communication.id} className="text-sm text-gray-700">
                  <td className="py-3">
                    <div className="font-medium text-gray-900">{label}</div>
                    <div className="text-xs text-gray-500">{communication.id}</div>
                  </td>
                  <td className="py-3">
                    <Badge tone="default">{communication.type.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="py-3 text-center">{communication.channel}</td>
                  <td className="py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                      {communication.status}
                    </span>
                  </td>
                  <td className="py-3 text-center text-xs text-gray-500">
                    {formatTimestamp(communication.createdAt)}
                  </td>
                  <td className="py-3 text-center">
                    <Link
                      to="/reporting"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold"
                    >
                      Reporting →
                    </Link>
                    {stats ? (
                      <div className="text-[11px] text-gray-400 mt-1">
                        Delivered {stats.delivered.toLocaleString()}
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-6 text-center text-sm text-gray-500">
                Create a communication to populate this table.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
}
