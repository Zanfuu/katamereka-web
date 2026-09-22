export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-24 text-center">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">Work in Progress</p>
    </div>
  )
}
