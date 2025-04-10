import React, { useState, useEffect, useRef } from 'react';

interface Image {
  url: string;
  mobileUrl?: string;
  caption: string;
}

interface ImageScrollerProps {
  images: Image[];
  interval?: number;
}

const ImageScroller: React.FC<ImageScrollerProps> = ({ images, interval = 7000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle auto-play
  useEffect(() => {
    if (!isPaused) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      }, interval);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [images.length, interval, isPaused]);

  // Handle touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true); // Pause on touch start
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) >= minSwipeDistance) {
      if (distance > 0) {
        // Swiped left
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
      } else {
        // Swiped right
        setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setIsPaused(false); // Resume on touch end
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div 
      className="relative w-full overflow-hidden h-[450px]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Images */}
      <div
        className="h-full w-full transition-transform duration-500 ease-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          display: 'flex',
        }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="h-full w-full flex-shrink-0"
            style={{
              backgroundImage: `url(${isMobile && image.mobileUrl ? image.mobileUrl : image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Caption removed for all views */}
          </div>
        ))}
      </div>

      {/* Navigation Arrows - Only show on desktop */}
      {!isMobile && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 focus:outline-none"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 focus:outline-none"
          >
            →
          </button>
        </>
      )}

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageScroller;
