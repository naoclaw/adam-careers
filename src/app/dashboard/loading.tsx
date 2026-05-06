export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-1/3 animate-pulse rounded-lg bg-gray-200" />
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl border border-gray-200 bg-white" />
    </div>
  );
}
