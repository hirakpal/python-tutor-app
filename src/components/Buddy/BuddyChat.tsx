interface BuddyChatProps {
  message: string
}

export function BuddyChat({ message }: BuddyChatProps) {
  return <div className="rounded-3xl border border-accent/30 bg-slate-900/90 p-4 text-sm leading-6 text-slate-100 shadow-lg">{message}</div>
}
