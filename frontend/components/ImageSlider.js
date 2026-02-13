import { useState, useEffect, useRef } from 'react';

export default function ImageSlider({ coverImage, images = [], productName }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);

  // Combine cover image and additional images
  const allImages = [coverImage, ...images].filter(Boolean);

  useEffect(() => {
    if (isPlaying && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
      }, 3000); // Change image every 3 seconds

      return () => clearInterval(intervalRef.current);
    }
  }, [isPlaying, allImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleMouseEnter = () => {
    setIsPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsPlaying(true);
  };

  if (allImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-gray-400">No image available</p>
      </div>
    );
  }

  if (allImages.length === 1) {
    return (
      <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-900">
        <img
          src={allImages[0]}
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-900"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Image */}
      <div className="relative w-full h-full">
        {allImages.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image}
              alt={`${productName} - Image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
        aria-label="Previous image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all"
        aria-label="Next image"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {allImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary w-6'
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>

      {/* Play/Pause Indicator */}
      <div className="absolute top-4 right-4">
        {isPlaying ? (
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
            Auto-play
          </div>
        ) : (
          <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
            Paused
          </div>
        )}
      </div>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded text-sm">
        {currentIndex + 1} / {allImages.length}
      </div>
    </div>
  );
}
