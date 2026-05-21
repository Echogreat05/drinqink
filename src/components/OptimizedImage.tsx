import { useState, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function OptimizedImage({ src, alt, className, width, height }: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const generateOptimizedSrc = (originalSrc: string) => {
    // This would integrate with an image optimization service like Cloudinary, Imgix, or similar
    // For now, we'll return the original src
    return originalSrc;
  };

  return (
    <div ref={imgRef} className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {isInView && (
        <img
          src={generateOptimizedSrc(src)}
          alt={alt}
          loading="lazy"
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          width={width}
          height={height}
        />
      )}
    </div>
  );
}
