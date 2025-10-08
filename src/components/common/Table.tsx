export default function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border-collapse">{children}</table>
    </div>
  );
}
