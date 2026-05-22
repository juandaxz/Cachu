export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-7 w-16 bg-secondary rounded" />
          <div className="h-3 w-52 bg-secondary rounded" />
        </div>
        <div className="h-9 w-28 bg-secondary rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  )
}
