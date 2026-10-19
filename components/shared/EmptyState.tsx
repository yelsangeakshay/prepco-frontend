import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  title: string;
  body?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function EmptyState({ title, body, icon: Icon = Inbox, action }: Props) {
  return (
    <div className="rounded-card border-line mx-auto flex max-w-md flex-col items-center border border-dashed bg-white/60 p-8 text-center">
      <Icon className="text-navy-400 size-8" aria-hidden />
      <h2 className="font-display mt-3 text-xl font-bold">{title}</h2>
      {body && <p className="text-navy-400 mt-1 text-sm">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
