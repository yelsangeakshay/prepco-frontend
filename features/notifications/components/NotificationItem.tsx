import { cn } from "@/lib/utils/cn";

interface Props {
  title: string;
  body?: string;
  time: string;
  read: boolean;
  onRead?: () => void;
}

export function NotificationItem({ title, body, time, read, onRead }: Props) {
  return (
    <button
      type="button"
      onClick={onRead}
      className={cn(
        "border-line flex min-h-14 w-full gap-3 border-b px-4 py-3 text-left last:border-0",
        !read && "bg-maroon-100/50",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-2 shrink-0 rounded-full",
          read ? "bg-transparent" : "bg-maroon-600",
        )}
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">
          {title}
          {!read && <span className="sr-only"> (unread)</span>}
        </span>
        {body && <span className="text-navy-400 block text-sm">{body}</span>}
        <span className="text-navy-400 mt-1 block text-xs">{time}</span>
      </span>
    </button>
  );
}
