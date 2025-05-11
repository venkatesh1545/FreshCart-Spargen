
import { cn } from "@/lib/utils";

interface ProductCardSkeletonProps {
  className?: string;
}

export function ProductCardSkeleton({ className }: ProductCardSkeletonProps) {
  return (
    <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
      {/* Image Skeleton */}
      <div className="aspect-square bg-muted shimmer" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category Skeleton */}
        <div className="h-3 w-1/3 bg-muted shimmer rounded" />
        
        {/* Title Skeleton */}
        <div className="h-5 w-full bg-muted shimmer rounded" />
        <div className="h-5 w-2/3 bg-muted shimmer rounded" />
        
        {/* Rating Skeleton */}
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-4 bg-muted shimmer rounded" />
          ))}
          <div className="h-4 w-8 bg-muted shimmer rounded ml-1" />
        </div>
        
        {/* Price and Button Skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-16 bg-muted shimmer rounded" />
          <div className="h-9 w-20 bg-muted shimmer rounded" />
        </div>
      </div>
    </div>
  );
}
