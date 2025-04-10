import React from 'react';
import { Link } from 'react-router-dom';
import webdev_thumbnail from './Webdev.jpg';

interface GalleryCardProps {
  gallery: {
    id: string;
    title: string;
    description: string;
    photo_count: number;
    thumbnail_url?: string;
  };
}

const GalleryCard = ({ gallery }: GalleryCardProps) => {
  return (
    <Link to={`/gallery/${gallery.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 overflow-hidden">
          <img
            src={gallery.thumbnail_url || webdev_thumbnail}
            alt={gallery.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="text-xl font-semibold mb-2">{gallery.title}</h3>
          <p className="text-gray-600 mb-2">{gallery.description}</p>
          <p className="text-sm text-gray-500">{gallery.photo_count} photos</p>
        </div>
      </div>
    </Link>
  );
};

export default GalleryCard;