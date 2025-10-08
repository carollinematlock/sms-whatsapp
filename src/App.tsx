import { NavLink, Outlet } from "react-router-dom";

export default function App() {
  const navigation = [
    { to: "/", label: "New Communication" },
    { to: "/inbox", label: "Inbox" },
    { to: "/communications", label: "All Communications" },
    { to: "/reporting", label: "Reporting" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-8">
          <span className="text-lg font-semibold">Coniq Messaging Prototype</span>
          <nav className="flex gap-1">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  [
                    "px-3 py-2 text-sm rounded-md transition",
                    isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
