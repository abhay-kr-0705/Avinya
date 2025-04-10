import React from 'react';
import { Gallery } from '../../types/gallery';
import GalleryCard from './GalleryCard';

interface GalleryGridProps {
  galleries: Gallery[];
}

const GalleryGrid: React.FC<GalleryGridProps> = ({ galleries }) => {
  if (galleries.length === 0) {
    return (
      <div className="text-center text-gray-600">
        No galleries available yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleries.map((gallery) => (
        <GalleryCard key={gallery.id} gallery={gallery} />
      ))}
    </div>
  );
};

export default GalleryGrid;