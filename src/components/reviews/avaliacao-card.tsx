import { formatarData } from "@/lib/utils";
import { Star } from "lucide-react";

interface AvaliacaoCardProps {
  rating: number;
  comment?: string | null;
  reviewerName: string;
  reviewerAvatar?: string | null;
  propertyTitle?: string;
  createdAt: Date | string;
}

export function AvaliacaoCard({
  rating,
  comment,
  reviewerName,
  reviewerAvatar,
  propertyTitle,
  createdAt,
}: AvaliacaoCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-sm font-bold text-slate-600 dark:text-slate-400 overflow-hidden">
          {reviewerAvatar ? (
            <img src={reviewerAvatar} alt={reviewerName} className="h-full w-full object-cover" />
          ) : (
            reviewerName[0]?.toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">{reviewerName}</p>
            <span className="text-xs text-slate-400 shrink-0">{formatarData(createdAt)}</span>
          </div>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700"}`}
              />
            ))}
          </div>
          {propertyTitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{propertyTitle}</p>
          )}
        </div>
      </div>
      {comment && (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{comment}</p>
      )}
    </div>
  );
}

export function EstrelaMedia({ media, total }: { media: number | null; total: number }) {
  if (total === 0 || media === null) {
    return <span className="text-sm text-slate-500">Sem avaliações</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-slate-900 dark:text-slate-100">{media.toFixed(1)}</span>
      <span className="text-sm text-slate-500">({total} avaliação{total !== 1 ? "ões" : ""})</span>
    </div>
  );
}
