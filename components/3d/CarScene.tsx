'use client'

import React from 'react';

const CarScene = () => {
  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg overflow-hidden">
      <div className="text-center text-white">
        <p className="text-lg font-medium">3D Car Model</p>
        <p className="text-sm text-gray-400">Car model is loading or unavailable</p>
      </div>
    </div>
  );
};

export default CarScene;