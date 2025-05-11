
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  // Handle image navigation
  const next = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  };

  const prev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  };

  // Handle zoom functionality
  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  return (
    <div className="w-full">
      {/* Main Image */}
      <div 
        className={cn(
          "relative w-full overflow-hidden rounded-lg bg-muted",
          isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        )}
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZoomed && setIsZoomed(false)}
      >
        <div 
          className={cn(
            "aspect-square transition-all",
            isZoomed ? "scale-150" : "scale-100"
          )}
          style={isZoomed ? {
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
          } : {}}
        >
          <img
            src={images[activeIndex]}
            alt={`${productName} - Image ${activeIndex + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
        
        {/* Controls */}
        <div className="absolute inset-0 flex items-center justify-between p-2">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/70 hover:bg-background/90"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            disabled={images.length <= 1}
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Previous image</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-background/70 hover:bg-background/90"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            disabled={images.length <= 1}
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Next image</span>
          </Button>
        </div>
        
        {/* Zoom indicator */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 rounded-full bg-background/70 hover:bg-background/90"
          onClick={(e) => {
            e.stopPropagation();
            toggleZoom();
          }}
        >
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Zoom</span>
        </Button>
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md",
                activeIndex === index ? "ring-2 ring-freshcart-500" : "opacity-60"
              )}
              onClick={() => {
                setActiveIndex(index);
                setIsZoomed(false);
              }}
            >
              <img
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
