import { Hammer } from 'lucide-react'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-8 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Hammer className="size-5" aria-hidden />
      </span>
      <h2 className="text-lg font-semibold text-balance">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground text-pretty">
        {description}
      </p>
    </div>
  )
}
