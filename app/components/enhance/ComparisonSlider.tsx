import React, { useState, useRef } from 'react';
import styles from './ComparisonSlider.module.css';

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  width: number;
  height: number;
}

export default function ComparisonSlider({ 
  beforeImage, 
  afterImage,
  width,
  height 
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleMove(e);
  };

  const handleMove = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current || !isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(Math.max(x, 0), 100));
  };

  React.useEffect(() => {
    const handleMouseUpGlobal = () => setIsDragging(false);
    const handleMouseMoveGlobal = (e: MouseEvent) => handleMove(e);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={styles.container}
      style={{ width, height }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={afterImage}
        alt="After"
        className={styles.image}
      />
      <div 
        className={styles.clipContainer}
        style={{ width: `${position}%` }}
      >
        <img
          src={beforeImage}
          alt="Before"
          className={styles.image}
        />
      </div>
      <div 
        className={styles.sliderHandle}
        style={{ left: `${position}%` }}
      >
        <div className={styles.sliderButton}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12H3M3 12L9 6M3 12L9 18" />
            <path d="M3 12H21M21 12L15 6M21 12L15 18" />
          </svg>
        </div>
      </div>
    </div>
  );
} 