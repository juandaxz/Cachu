export default function Loading() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-pulse">
      <div className="space-y-1">
        <div className="h-3 w-32 bg-secondary rounded" />
        <div className="h-7 w-40 bg-secondary rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-3 text-center space-y-2">
            <div className="h-7 w-10 bg-secondary rounded mx-auto" />
            <div className="h-3 w-16 bg-secondary rounded mx-auto" />
          </div>
        ))}
      </div>
      <SkeletonSection rows={3} />
      <SkeletonSection rows={2} />
    </div>
  )
}

function SkeletonSection({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <div className="h-4 w-28 bg-secondary rounded" />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  )
}
