export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="h-7 w-20 bg-secondary rounded" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-secondary rounded" />
            <div className="h-24 rounded-xl border border-border bg-card" />
          </div>
        ))}
      </div>
    </div>
  )
}
