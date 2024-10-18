import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface CarouselProps {
  images: string[];
}

const Carousel: React.FC<CarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 5000); // Auto-advance every 5 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleImageError = (index: number) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
    console.error(`Failed to load image at index ${index}: ${images[index]}`);
  };

  return (
    <div className="relative w-full h-[600px] mb-8 overflow-hidden rounded-lg shadow-xl">
      <div className="absolute top-0 left-0 w-full h-full flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {images.map((img, index) => (
          <div key={index} className="w-full h-full flex-shrink-0">
            {imageErrors[index] ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                <ImageIcon size={48} />
                <span className="ml-2">Failed to load image</span>
              </div>
            ) : (
              <img 
                src={img} 
                alt={`Resume template ${index + 1}`} 
                className="w-full h-full object-contain"
                onError={() => handleImageError(index)}
              />
            )}
          </div>
        ))}
      </div>
      <button onClick={goToPrevious} className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors">
        <ChevronLeft size={24} />
      </button>
      <button onClick={goToNext} className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/75 transition-colors">
        <ChevronRight size={24} />
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
