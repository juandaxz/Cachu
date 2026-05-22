export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="h-7 w-20 bg-secondary rounded" />
          <div className="h-3 w-44 bg-secondary rounded" />
        </div>
        <div className="h-9 w-28 bg-secondary rounded-lg" />
      </div>
      <div className="h-10 bg-secondary rounded-lg" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  )
}
