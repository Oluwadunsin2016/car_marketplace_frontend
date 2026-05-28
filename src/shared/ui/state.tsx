import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { AlertTriangle, CarFront, RefreshCw, WifiOff } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

type StateBlockProps = {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export const StateBlock = ({ icon, eyebrow, title, description, action, className }: StateBlockProps) => (
  <div className={cn("flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center", className)}>
    <span className="grid size-12 place-items-center rounded-md bg-slate-100 text-slate-500">
      {icon || <CarFront className="size-5" />}
    </span>
    {eyebrow ? <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p> : null}
    <h3 className="mt-3 text-lg font-bold text-slate-950">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const EmptyState = (props: StateBlockProps) => <StateBlock {...props} />;

export const ErrorState = ({
  icon,
  title = "Something went wrong",
  description = "We could not load this section. Check your connection and try again.",
  action,
  onRetry,
  className,
}: {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  onRetry?: () => void;
  className?: string;
}) => (
  <StateBlock
    className={cn("border-red-200 bg-red-50/40", className)}
    icon={icon || <AlertTriangle className="size-5 text-red-600" />}
    eyebrow="Unable to load"
    title={title}
    description={description}
    action={
      action || (onRetry ? (
        <Button type="button" onClick={onRetry} className="rounded-md bg-slate-950 text-white hover:bg-slate-800">
          <RefreshCw className="size-4" />
          Try again
        </Button>
      ) : null)
    }
  />
);

export const CarGridSkeleton = ({ count = 8, className }: { count?: number; className?: string }) => (
  <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-4", className)}>
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="aspect-[4/3] animate-pulse bg-slate-200" />
        <div className="space-y-4 p-4">
          <div className="h-5 w-4/5 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3">
            <div className="h-4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 animate-pulse rounded bg-slate-100" />
            <div className="h-4 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="flex items-end justify-between">
            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const PanelSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("rounded-lg border border-slate-200 bg-white p-5 shadow-sm", className)}>
    <div className="h-4 w-32 animate-pulse rounded bg-slate-100" />
    <div className="mt-3 h-7 w-2/3 animate-pulse rounded bg-slate-200" />
    <div className="mt-4 space-y-3">
      <div className="h-4 animate-pulse rounded bg-slate-100" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
      <div className="h-4 w-3/5 animate-pulse rounded bg-slate-100" />
    </div>
  </div>
);

export const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== "undefined" && !navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="sticky top-16 z-40 border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm font-semibold text-amber-900">
      <span className="inline-flex items-center gap-2">
        <WifiOff className="size-4" />
        You are offline. Some marketplace data may not refresh until your connection returns.
      </span>
    </div>
  );
};
